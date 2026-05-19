import {Routes} from '@angular/router';
import {authGuard} from '../../core/auth/guards/auth.guard';
import {LayoutComponent} from './settings/layout/layout.component';
import {tenantGuard} from '../../core/auth/guards/tenant.guard';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, tenantGuard],
    children: [
      {
        path: 'personal',
        loadComponent: () => import('./settings/personal-settings/component/personal-settings.component').then(m => m.PersonalSettingsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./settings/users/page/users-page.component').then(m => m.UsersPageComponent)
      },
      {
        path: 'workspace',
        loadComponent: () => import('./settings/workspace/component/workspace-settings/workspace-settings.component').then(m => m.WorkspaceSettingsComponent)
      },
      {
        path: '',
        redirectTo: 'personal',
        pathMatch: 'full'
      }
    ]
  }
]
