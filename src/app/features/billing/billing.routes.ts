import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: 'time-tracking',
    loadComponent: () =>
      import('./pages/time-tracker/time-tracker.component').then(
        (m) => m.TimeTrackerComponent
      ),
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/invoices/invoice-list.component').then(
        (m) => m.InvoiceListComponent
      ),
  },
  {
    path: '',
    redirectTo: 'time-tracking',
    pathMatch: 'full',
  },
];
