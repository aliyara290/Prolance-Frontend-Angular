import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.MARKETING_ROUTES)
  },
//   {
//     path: '404',
//     loadComponent: () => import('./core/components/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent)
//   },
  {
    path: '**',
    redirectTo: '404'
  }
];
