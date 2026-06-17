import { Routes } from '@angular/router';

export const MILESTONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/milestones-list/milestones-page.component').then(m => m.MilestonesPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/milestone-form/milestone-form-page.component').then(m => m.MilestoneFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/milestone-form/milestone-form-page.component').then(m => m.MilestoneFormPageComponent),
  },
  // Optionally, a detail view could be added here later:
  // {
  //   path: ':id',
  //   loadComponent: () =>
  //     import('./pages/milestone-details/milestone-details-page.component').then(m => m.MilestoneDetailsPageComponent),
  // },
];
