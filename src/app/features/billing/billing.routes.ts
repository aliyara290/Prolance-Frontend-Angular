import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/billing-overview/billing-overview.component').then(m => m.BillingOverviewComponent)
  },
  {
    path: 'invoices',
    loadComponent: () => import('./pages/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./pages/invoices/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent)
  },
  {
    path: 'invoices/:id',
    loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
  },
  {
    path: 'time-tracking',
    loadComponent: () => import('./pages/time-tracking/time-tracking.component').then(m => m.TimeTrackingComponent)
  }
];
