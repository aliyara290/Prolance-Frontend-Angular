import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.MARKETING_ROUTES)
  },
  {
    path: 'app',
    loadChildren: () => import('./core/layout/layout.routes').then(m => m.LAYOUT_ROUTES)
  },

  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
