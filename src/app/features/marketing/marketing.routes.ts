import { Routes } from '@angular/router';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/page/home-page.component').then(m => m.HomePageComponent)
  }
];
