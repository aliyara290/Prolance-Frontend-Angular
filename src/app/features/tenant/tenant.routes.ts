import {Routes} from '@angular/router';
import {authGuard} from '../../core/auth/guards/auth.guard';

export const TENANT_ROUTES: Routes = [
  {
    path: 'personal',
    // canActivate: [authGuard],
    loadComponent: () => import('./settings/personal-settings/personal-settings.component').then(m => m.PersonalSettingsComponent)
  },
  {
    path: 'users',
    // canActivate: [authGuard],
    loadComponent: () => import('./settings/users/page/users-page.component').then(m => m.UsersPageComponent)
  }
]
