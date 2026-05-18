import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStateService } from '../../service/users-state.service';
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

  delete(): void {
    const id = this.user()?.id;
    if (id) this.state.deleteUser(id);
  }
}
