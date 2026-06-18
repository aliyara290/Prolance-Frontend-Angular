import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { ProjectMembersService } from '../../../services/project-members.service';
import { UsersStateService } from '../../../../tenant/settings/users/service/users-state.service';
import { WorkspaceUser } from '../../../../tenant/settings/users/models/user.models';
import {
  ProjectMember,
  MemberRole,
  AddMemberRequest,
  UpdateMemberRequest,
  ALL_MEMBER_ROLES,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_COLORS,
  MEMBER_STATUS_COLORS,
} from '../../../types/project-member.model';

@Component({
  selector: 'app-project-detail-members-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-detail-members-page.component.html',
  styleUrls: ['./project-detail-members-page.component.css'],
})
export class ProjectDetailMembersPageComponent implements OnInit, OnDestroy {
  readonly detailService = inject(ProjectDetailService);
  readonly membersService = inject(ProjectMembersService);
  private readonly usersStateService = inject(UsersStateService);

  // ── Add Member Modal ──
  readonly showAddModal = signal<boolean>(false);
  readonly selectedUserId = signal<string>('');
  readonly selectedRole = signal<MemberRole>('MEMBER');
  readonly selectedAllocation = signal<number>(100);
  readonly addingMember = signal<boolean>(false);

  // ── Edit Member ──
  readonly editingMemberId = signal<string | null>(null);
  readonly editRole = signal<MemberRole>('MEMBER');
  readonly editAllocation = signal<number>(100);

  // ── Search ──
  readonly searchQuery = signal<string>('');

  // ── Constants ──
  readonly allRoles = ALL_MEMBER_ROLES;
  readonly roleLabels = MEMBER_ROLE_LABELS;
  readonly roleColors = MEMBER_ROLE_COLORS;
  readonly statusColors = MEMBER_STATUS_COLORS;

  // ── Tenant Users (for select dropdown) ──
  readonly tenantUsers = this.usersStateService.usersList;

  // ── Available Users (not yet added to this project) ──
  readonly availableUsers = computed(() => {
    const currentMemberUserIds = new Set(this.membersService.members().map(m => m.userId));
    return this.tenantUsers().filter(u => !currentMemberUserIds.has(u.id) && u.status === 'ACTIVE');
  });

  // ── Filtered Members ──
  readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const members = this.membersService.members();
    if (!query) return members;
    const users = this.tenantUsers();
    return members.filter(m => {
      const user = users.find(u => u.id === m.userId);
      if (!user) return true;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(query) || user.email.toLowerCase().includes(query) || m.role.toLowerCase().includes(query);
    });
  });

  ngOnInit(): void {
    const project = this.detailService.project();
    if (project) {
      this.membersService.loadMembers(project.id, 0, 100);
    }
  }

  ngOnDestroy(): void {
    this.membersService.clear();
  }

  getUserForMember(member: ProjectMember): WorkspaceUser | null {
    return this.tenantUsers().find(u => u.id === member.userId) ?? null;
  }

  getInitials(user: WorkspaceUser): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // ── Add Member ──
  openAddModal(): void {
    this.selectedUserId.set('');
    this.selectedRole.set('MEMBER');
    this.selectedAllocation.set(100);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddMember(): void {
    const project = this.detailService.project();
    const userId = this.selectedUserId();
    if (!project || !userId) return;

    this.addingMember.set(true);
    const request: AddMemberRequest = {
      userId,
      role: this.selectedRole(),
      allocationPercentage: this.selectedAllocation(),
      status: 'ACTIVE',
    };

    this.membersService.addMember(project.id, request).subscribe({
      next: () => {
        this.addingMember.set(false);
        this.closeAddModal();
      },
      error: (err) => {
        console.error('Failed to add member', err);
        this.addingMember.set(false);
      },
    });
  }

  // ── Edit Member ──
  startEdit(member: ProjectMember): void {
    this.editingMemberId.set(member.userId);
    this.editRole.set(member.role);
    this.editAllocation.set(member.allocationPercentage);
  }

  cancelEdit(): void {
    this.editingMemberId.set(null);
  }

  saveEdit(member: ProjectMember): void {
    const project = this.detailService.project();
    if (!project) return;

    const request: UpdateMemberRequest = {
      role: this.editRole(),
      allocationPercentage: this.editAllocation(),
      status: member.status,
    };

    this.membersService.updateMember(project.id, member.userId, request).subscribe({
      next: () => {
        this.editingMemberId.set(null);
      },
      error: (err) => {
        console.error('Failed to update member', err);
      },
    });
  }

  // ── Remove Member ──
  onRemove(member: ProjectMember): void {
    const project = this.detailService.project();
    const user = this.getUserForMember(member);
    const name = user ? `${user.firstName} ${user.lastName}` : member.userId;

    if (!project || !confirm(`Remove "${name}" from this project?`)) return;

    this.membersService.removeMember(project.id, member.userId).subscribe({
      error: (err) => {
        console.error('Failed to remove member', err);
        // Reload on error to restore the list
        this.membersService.loadMembers(project.id, 0, 100);
      },
    });
  }
}
