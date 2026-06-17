import { Routes } from '@angular/router';
import { LayoutShellComponent } from './layout-shell.component';
import { authGuard } from '../auth/guards/auth.guard';
import { tenantGuard } from '../auth/guards/tenant.guard';
import { TENANT_ROUTES } from '../../features/tenant/tenant.routes';

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
      {
        path: 'crm/clients',
        loadChildren: () =>
          import('../../features/crm/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
      },
      {
        path: 'crm/contacts',
        loadChildren: () =>
          import('../../features/crm/contacts/contacts.routes').then(m => m.CONTACTS_ROUTES)
      },
      {
        path: 'crm/deals',
        loadChildren: () =>
          import('../../features/crm/deals/deals.routes').then(m => m.DEALS_ROUTES)
      },
      // ── Project workspace routes ──
      {
        path: 'projects/dashboard',
        loadComponent: () =>
          import('../../features/project/pages/project-dashboard/project-dashboard-page.component').then(
            m => m.ProjectDashboardPageComponent
          ),
      },
      {
        path: 'projects/all',
        loadChildren: () =>
          import('../../features/project/projects.routes').then(m => m.PROJECTS_ROUTES),
      },
      {
        path: 'projects/milestones',
        loadChildren: () =>
          import('../../features/milestone/milestones.routes').then(m => m.MILESTONES_ROUTES),
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
