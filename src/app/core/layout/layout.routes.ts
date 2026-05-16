import { Routes } from '@angular/router';
import { LayoutShellComponent } from './layout-shell.component';
import { authGuard } from '../auth/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/temp-dashboard/temp-dashboard.component').then(m => m.TempDashboardComponent)
      },
      {
        path: 'crm/leads',
        loadChildren: () =>
          import('../../features/crm/leads/leads.routes').then(m => m.LEADS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'crm/leads',
        pathMatch: 'full'
      }
    ]
  }
];
