import { Routes } from '@angular/router';
import {HeaderComponent} from './core/layout/components/header/header.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.MARKETING_ROUTES)
  },
  {
    path: 'app',
    loadChildren: () => import('./core/layout/layout.routes').then(m => m.LAYOUT_ROUTES)
  },

  {
    path: '**',
    redirectTo: ''
  }
];
