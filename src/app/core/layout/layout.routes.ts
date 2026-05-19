import { Routes } from '@angular/router';
import { LayoutShellComponent } from './layout-shell.component';
import { authGuard } from '../auth/guards/auth.guard';
import { tenantGuard } from '../auth/guards/tenant.guard';
import {TENANT_ROUTES} from '../../features/tenant/tenant.routes';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard, tenantGuard],
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
      // {
      //   path: 'settings',
      //   loadChildren: () => import('../../features/tenant/tenant.routes').then(m => m.TENANT_ROUTES)
      // },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
