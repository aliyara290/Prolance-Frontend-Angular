import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/clients-page.component').then(m => m.ClientsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/client-form/client-form-page.component').then(m => m.ClientFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/client-form/client-form-page.component').then(m => m.ClientFormPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/client-details/client-details-page.component').then(m => m.ClientDetailsPageComponent),
  },
];
