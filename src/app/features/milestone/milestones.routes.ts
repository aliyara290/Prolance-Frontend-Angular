import { Routes } from '@angular/router';

export const MILESTONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/milestones-list/milestones-page.component').then(m => m.MilestonesPageComponent),
  },
];
