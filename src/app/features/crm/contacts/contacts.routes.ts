import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contacts-page.component').then(m => m.ContactsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/contact-form/contact-form-page.component').then(m => m.ContactFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/contact-form/contact-form-page.component').then(m => m.ContactFormPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/contact-details/contact-details-page.component').then(m => m.ContactDetailsPageComponent),
  },
];
