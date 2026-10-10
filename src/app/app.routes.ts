import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'dmh.dev | Dennis Martin Herbers',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'projects',
    title: 'Projects | dmh.dev',
    loadComponent: () => import('./features/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'blog',
    title: 'Blog | dmh.dev',
    loadComponent: () => import('./features/blog/blog').then((m) => m.Blog),
  },
  {
    path: 'about',
    title: 'About | dmh.dev',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: 'impressum',
    title: 'Impressum / Legal Notice | dmh.dev',
    loadComponent: () => import('./features/impressum/impressum').then((m) => m.Impressum),
  },
  {
    path: 'privacy',
    title: 'Datenschutzerklärung / Privacy Policy | dmh.dev',
    loadComponent: () => import('./features/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
