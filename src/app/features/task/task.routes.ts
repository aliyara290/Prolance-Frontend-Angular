import { Routes } from '@angular/router';
import {TaskPageComponent} from './pages/task-page/task-page.component';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/task-page/task-page.component').then(m => m.TaskPageComponent),
  }
];
