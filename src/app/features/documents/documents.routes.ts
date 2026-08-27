import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/documents-page/documents-page.component').then(
        (m) => m.DocumentsPageComponent
      )
  }
];
