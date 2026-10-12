import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'voynich',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'voynich/:section',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        { section: 'walkthroughs' },
        { section: 'identifications' },
        { section: 'folios' },
        { section: 'grammar' },
        { section: 'library' },
      ];
    },
  },
  {
    path: 'kaleidoscope',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'impressum',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'privacy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
