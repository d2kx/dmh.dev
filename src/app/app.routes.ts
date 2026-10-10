import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'dmh.dev — Dennis Martin Herbers',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'projects',
    title: 'Projects & Mini-Apps — dmh.dev',
    loadComponent: () => import('./features/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'blog',
    title: 'Blog — dmh.dev',
    loadComponent: () => import('./features/blog/blog').then((m) => m.Blog),
  },
  {
    path: 'about',
    title: 'About — dmh.dev',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
