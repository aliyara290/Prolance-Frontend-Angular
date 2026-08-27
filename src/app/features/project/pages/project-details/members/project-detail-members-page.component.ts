import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { ProjectMembersService } from '../../../services/project-members.service';
import { UsersStateService } from '../../../../tenant/settings/users/service/users-state.service';
import { WorkspaceUser } from '../../../../tenant/settings/users/models/user.models';
import {
  ProjectMember,
  MemberRole,
  MemberStatus,
  AddMemberRequest,
  UpdateMemberRequest,
  ALL_MEMBER_ROLES,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_COLORS,
  MEMBER_STATUS_COLORS,
} from '../../../types/project-member.model';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import {ErrorMessageComponent} from '../../../../../shared/ui/error-message/error-message.component';

import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { CustomSelectComponent, CustomSelectOption } from '../../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-project-detail-members-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownMenuComponent, ErrorMessageComponent, CustomSelectComponent],
  templateUrl: './project-detail-members-page.component.html',
  styleUrls: ['./project-detail-members-page.component.css'],
})
export class ProjectDetailMembersPageComponent implements OnInit, OnDestroy {
  readonly detailService = inject(ProjectDetailService);
  readonly membersService = inject(ProjectMembersService);
  private readonly usersStateService = inject(UsersStateService);
  private readonly confirmService = inject(ConfirmModalService);

  // ── Add Member Modal ──
  readonly showAddModal = signal<boolean>(false);
  readonly selectedUserId = signal<string>('');
  readonly selectedRole = signal<MemberRole>('MEMBER');
  readonly selectedAllocation = signal<number>(100);
  readonly addingMember = signal<boolean>(false);
  readonly addUserSearch = signal<string>('');

  // ── Edit Member ──
  readonly editingMemberId = signal<string | null>(null);
  readonly editRole = signal<MemberRole>('MEMBER');
  readonly editAllocation = signal<number>(100);

  // ── Search & Filter ──
  readonly searchQuery = signal<string>('');
  readonly filterRole = signal<MemberRole | 'ALL'>('ALL');
  readonly filterStatus = signal<MemberStatus | 'ALL'>('ALL');

  // ── Detail Drawer ──
  readonly showDetailDrawer = signal<boolean>(false);
  readonly selectedMember = signal<ProjectMember | null>(null);

  // ── Constants ──
  readonly allRoles = ALL_MEMBER_ROLES;
  readonly roleLabels = MEMBER_ROLE_LABELS;
  readonly roleColors = MEMBER_ROLE_COLORS;
  readonly statusColors = MEMBER_STATUS_COLORS;

  readonly roleSelectOptions: CustomSelectOption[] = this.allRoles.map(r => ({ label: this.roleLabels[r], value: r }));
  readonly statusSelectOptions: CustomSelectOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  readonly filterRoleSelectOptions: CustomSelectOption[] = [
    { label: 'All Roles', value: 'ALL' },
    ...this.roleSelectOptions
  ];

  // ── Tenant Users ──
  readonly tenantUsers = this.usersStateService.usersList;

  // ── Available Users (not yet added) ──
  readonly availableUsers = computed(() => {
    const currentMemberUserIds = new Set(this.membersService.members().map(m => m.userId));
    return this.tenantUsers().filter(u => !currentMemberUserIds.has(u.keycloakUserId) && u.status === 'ACTIVE');
  });

  // ── Filtered available users for add modal search ──
  readonly filteredAvailableUsers = computed(() => {
    const query = this.addUserSearch().toLowerCase();
    const users = this.availableUsers();
    if (!query) return users;
    return users.filter(u => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(query) || u.email.toLowerCase().includes(query);
    });
  });

  // ── Filtered Members ──
  readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const roleFilter = this.filterRole();
    const statusFilter = this.filterStatus();
    let members = this.membersService.members();

    if (roleFilter !== 'ALL') {
      members = members.filter(m => m.role === roleFilter);
    }
    if (statusFilter !== 'ALL') {
      members = members.filter(m => m.status === statusFilter);
    }
    if (!query) return members;

    const users = this.tenantUsers();
    return members.filter(m => {
      const user = users.find(u => u.keycloakUserId === m.userId);
      if (!user) return true;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(query) || user.email.toLowerCase().includes(query) || m.role.toLowerCase().includes(query);
    });
  });



  constructor() {
    effect(() => {
      const project = this.detailService.project();
      if (project) {
        this.membersService.loadMembers(project.id, 0, 100);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.membersService.clear();
  }

  getUserForMember(member: ProjectMember): WorkspaceUser | null {
    return this.tenantUsers().find(u => u.keycloakUserId === member.userId) ?? null;
  }

  getInitials(user: WorkspaceUser): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // ── Add Modal ──
  openAddModal(): void {
    this.selectedUserId.set('');
    this.selectedRole.set('MEMBER');
    this.selectedAllocation.set(100);
    this.addUserSearch.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  selectUserForAdd(user: WorkspaceUser): void {
    this.selectedUserId.set(user.keycloakUserId);
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

  // ── Detail Drawer ──
  openMemberDetail(member: ProjectMember): void {
    this.selectedMember.set(member);
    this.showDetailDrawer.set(true);
  }

  closeDetailDrawer(): void {
    this.showDetailDrawer.set(false);
    this.selectedMember.set(null);
  }

  // ── Inline Edit ──
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

  async onRemove(member: ProjectMember): Promise<void> {
    const project = this.detailService.project();
    const user = this.getUserForMember(member);
    const name = user ? `${user.firstName} ${user.lastName}` : member.userId;

    if (!project) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Member',
      message: `Are you sure you want to remove "${name}" from this project?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.membersService.removeMember(project.id, member.userId).subscribe({
      next: () => {
        if (this.selectedMember()?.userId === member.userId) {
          this.closeDetailDrawer();
        }
      },
      error: (err) => {
        console.error('Failed to remove member', err);
        this.membersService.loadMembers(project.id, 0, 100);
      },
    });
  }

  getMoreActions(member: ProjectMember): DropdownMenuItem[] {
    const actions: DropdownMenuItem[] = [
      { label: 'View Details', value: 'view' },
      { label: 'Edit Member', value: 'edit' },
    ];
    if (member.role !== 'OWNER') {
      actions.push({ label: 'Remove Member', value: 'remove', danger: true, dividerBefore: true });
    }
    return actions;
  }

  onMoreAction(item: DropdownMenuItem, member: ProjectMember): void {
    if (item.value === 'view') {
      this.openMemberDetail(member);
    } else if (item.value === 'edit') {
      this.startEdit(member);
    } else if (item.value === 'remove') {
      this.onRemove(member);
    }
  }

  getSelectedUser(): WorkspaceUser | null {
    const userId = this.selectedUserId();
    if (!userId) return null;
    return this.availableUsers().find(u => u.keycloakUserId === userId) ?? null;
  }

  getRoleBg(role: MemberRole): string {
    return this.roleColors[role] + '18';
  }

  getStatusBg(status: MemberStatus): string {
    return this.statusColors[status] + '18';
  }
}
