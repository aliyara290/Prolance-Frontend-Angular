import {Component, inject} from '@angular/core';
import { RouterLink } from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {Store} from '@ngrx/store';
import {selectIsAuthenticated} from '../../../../../core/auth/store/auth.selectors';

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: "marketing-hero.component.html"
})
export class MarketingHeroComponent {
  private readonly store = inject(Store);

  public isAuthenticated$ = this.store.select(selectIsAuthenticated);
}
