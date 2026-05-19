import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStateService } from '../../service/users-state.service';
import { UserStatus, WorkspaceUser } from '../../models/user.models';
import { getInitials, getRoleBadgeClass, getRoleLabel, getStatusDotClass } from '../../util/user.utils';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private state = inject(UsersStateService);

  // ── State bindings ──
  readonly isLoading    = this.state.isLoading;
  readonly error        = this.state.error;
  readonly activeTab    = this.state.activeTab;
  readonly tabCounts    = this.state.tabCounts;
  readonly filteredUsers = this.state.filteredUsers;
  readonly selectedUser = this.state.selectedUser;
  readonly searchQuery  = this.state.searchQuery;

  readonly tabs: { key: UserStatus; label: string }[] = [
    { key: 'ACTIVE',      label: 'Active Users' },
    { key: 'PENDING',     label: 'Invited'       },
    { key: 'DEACTIVATED', label: 'Deactivated'   },
  ];

  // ── Util passthrough ──
  getInitials      = getInitials;
  getRoleBadgeClass = getRoleBadgeClass;
  getRoleLabel      = getRoleLabel;
  getStatusDotClass = getStatusDotClass;

  // ── Computed helpers ──
  get hasDetailOpen(): boolean {
    return this.selectedUser() !== null;
  }

  getTabCount(key: UserStatus): number {
    return this.tabCounts()[key] || 0;
  }

  // ── Actions ──
  setTab(tab: UserStatus): void {
    this.state.setTab(tab);
  }

  onSearch(q: string): void {
    this.state.setSearch(q);
  }

  selectUser(user: WorkspaceUser): void {
    this.state.selectUser(user.id);
  }
}
