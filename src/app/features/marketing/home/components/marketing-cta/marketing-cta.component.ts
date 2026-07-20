import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-marketing-cta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: 'marketing-cta.component.html'
})
export class MarketingCtaComponent {
  private readonly authService = inject(AuthService);

  register() {
    this.authService.register();
  }
}
