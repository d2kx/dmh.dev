import { Routes } from '@angular/router';
import { RouteSeoData } from './core/seo';

export const routes: Routes = [
  {
    path: '',
    title: 'dmh.dev | Dennis Martin Herbers',
    data: {
      seo: {
        description:
          'Personal website, software engineering projects, and technical blog of Dennis Martin Herbers (dmh.dev).',
        ogType: 'website',
      } satisfies RouteSeoData,
    },
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'blog',
    title: 'Blog | dmh.dev',
    data: {
      seo: {
        description:
          'Articles and technical notes on software development, web design, and personal projects by Dennis Martin Herbers.',
        ogType: 'website',
      } satisfies RouteSeoData,
    },
    loadComponent: () => import('./features/blog/blog').then((m) => m.Blog),
  },
  {
    path: 'impressum',
    title: 'Impressum / Legal Notice | dmh.dev',
    data: {
      seo: {
        description:
          'Impressum (§ 5 DDG, § 18 Abs. 2 MStV) and Legal Notice for dmh.dev by Dennis Martin Herbers.',
        ogType: 'website',
        locale: 'de_DE',
      } satisfies RouteSeoData,
    },
    loadComponent: () => import('./features/impressum/impressum').then((m) => m.Impressum),
  },
  {
    path: 'privacy',
    title: 'Datenschutzerklärung / Privacy Policy | dmh.dev',
    data: {
      seo: {
        description:
          'Datenschutzerklärung (Art. 13 DSGVO) and GDPR Privacy Policy for dmh.dev by Dennis Martin Herbers.',
        ogType: 'website',
        locale: 'de_DE',
      } satisfies RouteSeoData,
    },
    loadComponent: () => import('./features/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
