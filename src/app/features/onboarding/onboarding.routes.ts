import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { noTenantGuard } from '../../core/auth/guards/no-tenant.guard';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: 'company',
    canActivate: [authGuard, noTenantGuard],
    loadComponent: () =>
      import('./pages/company-onboarding/company-onboarding-page.component').then(
        m => m.CompanyOnboardingPageComponent
      )
  },
  {
    path: '',
    redirectTo: 'company',
    pathMatch: 'full'
  }
];
