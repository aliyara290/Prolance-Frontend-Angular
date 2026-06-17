import { Routes } from '@angular/router';

export const DEALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/deals-page.component').then(m => m.DealsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/deal-form/deal-form-page.component').then(m => m.DealFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/deal-form/deal-form-page.component').then(m => m.DealFormPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/deal-details/deal-details-page.component').then(m => m.DealDetailsPageComponent),
  },
];
