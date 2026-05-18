import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStateService } from '../service/users-state.service';
import { UserListComponent } from '../components/user-list/user-list.component';
import { UserDetailComponent } from '../components/user-detail/user-detail.component';
import { UserModalComponent } from '../components/user-modal/user-modal.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent,
    UserDetailComponent,
    UserModalComponent,
  ],
  templateUrl: './users-page.component.html',
})
export class UsersPageComponent {
  private state = inject(UsersStateService);

  @ViewChild(UserModalComponent)
  private inviteModal!: UserModalComponent;

  readonly isDark      = this.state.isDark;
  readonly selectedUser = this.state.selectedUser;

  toggleDark(): void {
    this.state.toggleDark();
  }

  openInviteModal(): void {
    this.inviteModal.open();
  }
}
