import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/events-page/events-page').then((m) => m.EventsPageComponent),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-detail-page/event-detail-page').then((m) => m.EventDetailPageComponent),
  },
  { path: '**', redirectTo: '' },
];
