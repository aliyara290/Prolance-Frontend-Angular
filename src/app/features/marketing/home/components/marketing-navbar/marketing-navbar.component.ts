import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-marketing-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: "marketing-navbar.component.html"
})
export class MarketingNavbarComponent {
  private readonly authService = inject(AuthService);

  login() {
    this.authService.login();
  }

  register() {
    this.authService.register();
  }
}
