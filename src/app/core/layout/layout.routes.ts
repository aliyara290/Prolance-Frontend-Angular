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
        path: 'crm/dashboard',
        loadChildren: () =>
          import('../../features/crm/dashboard/crm-dashboard.routes').then(m => m.CRM_DASHBOARD_ROUTES)
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
        path: 'projects/tasks',
        loadChildren: () =>
          import('../../features/task/task.routes').then(m => m.TASK_ROUTES),
      },
      {
        path: 'projects/docs',
        loadChildren: () =>
          import('../../features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES),
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
