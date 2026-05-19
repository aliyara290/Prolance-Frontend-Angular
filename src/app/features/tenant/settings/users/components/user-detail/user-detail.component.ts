import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStateService } from '../../service/users-state.service';
import { UserRole, WorkspaceUser, ALL_ROLES } from '../../models/user.models';
import { getInitials, getRoleBadgeClass, getRoleLabel, getStatusDotClass } from '../../util/user.utils';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent {
  private state = inject(UsersStateService);

  readonly user = this.state.selectedUser;
  readonly allRoles = ALL_ROLES;

  // ── Util passthrough ──
  getInitials       = getInitials;
  getRoleBadgeClass = getRoleBadgeClass;
  getRoleLabel      = getRoleLabel;
  getStatusDotClass = getStatusDotClass;

  // ── Actions ──
  close(): void {
    this.state.clearSelection();
  }

  deactivate(): void {
    const id = this.user()?.id;
    if (id) this.state.deactivateUser(id);
  }

  reactivate(): void {
    const id = this.user()?.id;
    if (id) this.state.reactivateUser(id);
  }

  addRole(role: string): void {
    const id = this.user()?.id;
    if (id && role) {
      this.state.addUserRole(id, role as UserRole);
    }
  }

  removeRole(role: UserRole): void {
    const id = this.user()?.id;
    if (id && role) {
      this.state.removeUserRole(id, role);
    }
  }

  availableRolesToAdd(u: WorkspaceUser): UserRole[] {
    if (!u || !u.roles) return [];
    return this.allRoles.filter(r => !u.roles.includes(r));
  }
}
