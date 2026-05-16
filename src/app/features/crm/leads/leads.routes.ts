import { Routes } from '@angular/router';

export const LEADS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/leads-page.component').then(m => m.LeadsPageComponent),
  },
];
