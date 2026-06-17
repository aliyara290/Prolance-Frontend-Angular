import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projects-list/projects-page.component').then(m => m.ProjectsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/project-form/project-form-page.component').then(m => m.ProjectFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/project-form/project-form-page.component').then(m => m.ProjectFormPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/project-details/project-details-page.component').then(m => m.ProjectDetailsPageComponent),
  },
];
