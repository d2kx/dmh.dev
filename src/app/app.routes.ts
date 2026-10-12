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
    path: 'voynich',
    children: [
      {
        path: '',
        title: 'Voynich | dmh.dev',
        data: {
          seo: {
            description:
              'Interactive visual reader, 3-step morphological word decoder, 227-folio EVA corpus, and research archive for the Voynich Manuscript (Beinecke MS 408).',
            ogType: 'website',
            ogImage: 'https://www.dmh.dev/og-voynich.png',
            ogImageAlt: 'dmh.dev Voynich · 15th-Century Illustrated Codex Explorer',
          } satisfies RouteSeoData,
        },
        loadComponent: () => import('./features/voynich/voynich').then((m) => m.Voynich),
      },
      {
        path: ':section',
        title: 'Voynich | dmh.dev',
        data: {
          seo: {
            description:
              'Explore annotated Voynich Manuscript walkthroughs, botanical and astronomical identifications, the 227-folio corpus, grammar paradigms, and research library.',
            ogType: 'website',
            ogImage: 'https://www.dmh.dev/og-voynich.png',
            ogImageAlt: 'dmh.dev Voynich · 15th-Century Illustrated Codex Explorer',
            sectionSeo: {
              walkthroughs: {
                title: 'Voynich Walkthroughs | dmh.dev',
                description:
                  'Step-by-step annotated folio walkthroughs of the Voynich Manuscript with inline transliterations, translations, and high-resolution scan overlays.',
              },
              identifications: {
                title: 'Voynich Identifications | dmh.dev',
                description:
                  'Proposed botanical, astronomical, and pharmaceutical identifications from the Voynich Manuscript (Beinecke MS 408) with confidence scores and visual cribs.',
              },
              library: {
                title: 'Voynich Library | dmh.dev',
                description:
                  'Plain-English reading guides, complete Beinecke MS 408 PDF editions, and structured JSON research datasets for the Voynich Manuscript.',
              },
              folios: {
                title: 'Voynich Folios | dmh.dev',
                description:
                  'Browse all 227 folios of the Voynich Manuscript (Beinecke MS 408) with EVA transliterations, interlinear structural glosses, and quire metadata.',
              },
              grammar: {
                title: 'Voynich Grammar | dmh.dev',
                description:
                  'Explore the morphological grammar of Voynichese: prefixes, gallows roots, suffixes, and positional slot distribution across the 37,000-token corpus.',
              },
            },
          } satisfies RouteSeoData,
        },
        loadComponent: () => import('./features/voynich/voynich').then((m) => m.Voynich),
      },
    ],
  },
  {
    path: 'kaleidoscope',
    title: 'Kaleidoscope | dmh.dev',
    data: {
      seo: {
        description:
          'Interactive WebGL shader kaleidoscope blending psychedelic fractal symmetry with sakura cherry blossom geometry and harmonic color palettes.',
        ogType: 'website',
        ogImage: 'https://www.dmh.dev/og-kaleidoscope.png',
        ogImageAlt: 'dmh.dev Kaleidoscope · Generative Fractal & Sakura Kaleidoscope',
      } satisfies RouteSeoData,
    },
    loadComponent: () =>
      import('./features/kaleidoscope/kaleidoscope').then((m) => m.Kaleidoscope),
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
