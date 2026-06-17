import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { tenantGuard } from '../../core/auth/guards/tenant.guard';
import { ProjectLayoutComponent } from './layout/shell/project-layout.component';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    component: ProjectLayoutComponent,
    canActivate: [authGuard, tenantGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/project-dashboard/project-dashboard-page.component').then(
            m => m.ProjectDashboardPageComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
