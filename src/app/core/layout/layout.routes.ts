import { Routes } from '@angular/router';
import { LayoutShellComponent } from './layout-shell.component';
import { authGuard } from '../auth/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      // Example of how future routes will be wired up:
      // {
      //   path: 'projects',
      //   loadChildren: () => import('../../features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
      // }

      // Temporary fallback dashboard for testing the layout
      {
        path: 'leads',
        loadComponent: () => import('./components/temp-dashboard/temp-dashboard.component').then(m => m.TempDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/temp-dashboard/temp-dashboard.component').then(m => m.TempDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'leads',
        pathMatch: 'full'
      }
    ]
  }
];
