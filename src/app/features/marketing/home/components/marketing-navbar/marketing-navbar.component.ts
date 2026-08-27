import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import {Store} from '@ngrx/store';
import {selectIsAuthenticated} from '../../../../../core/auth/store/auth.selectors';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-marketing-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: "marketing-navbar.component.html"
})
export class MarketingNavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);

  public isAuthenticated$ = this.store.select(selectIsAuthenticated);

  login() {
    this.authService.login();
  }

  register() {
    this.authService.register();
  }
}
