import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "user-menu.component.html"
})
export class UserMenuComponent {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);

  user$ = this.store.select(selectAuthUser);

  // TODO: Add dropdown logic and replace with actual initials
  userInitials(): string {
    return 'JD'; // placeholder
  }

  logout() {
    this.authService.logout();
  }
}
