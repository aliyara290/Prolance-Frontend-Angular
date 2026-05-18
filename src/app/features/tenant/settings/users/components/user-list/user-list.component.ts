import { Component, inject } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStateService } from '../../service/users-state.service';
import { UserStatus, WorkspaceUser } from '../../models/user.models';
import { getInitials, getRoleBadgeClass, getRoleLabel, getStatusDotClass } from '../../util/user.utils';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private state = inject(UsersStateService);

  // ── State bindings ──
  readonly activeTab    = this.state.activeTab;
  readonly tabCounts    = this.state.tabCounts;
  readonly filteredUsers = this.state.filteredUsers;
  readonly selectedUser = this.state.selectedUser;
  readonly searchQuery  = this.state.searchQuery;

  readonly tabs: { key: UserStatus; label: string }[] = [
    { key: 'active',      label: 'Active Users' },
    { key: 'invited',     label: 'Invited'       },
    { key: 'deactivated', label: 'Deactivated'   },
  ];

  // ── Util passthrough (used in template) ──
  getInitials      = getInitials;
  getRoleBadgeClass = getRoleBadgeClass;
  getRoleLabel      = getRoleLabel;
  getStatusDotClass = getStatusDotClass;

  // ── Computed helpers ──
  get hasDetailOpen(): boolean {
    return this.selectedUser() !== null;
  }

  getTabCount(key: UserStatus): number {
    return this.tabCounts()[key];
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
