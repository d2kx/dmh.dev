import { Location } from '@angular/common';
import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { VOYNICH_VERSION } from '../features/voynich/voynich-version';

export type ShellAppMode = 'main' | 'voynich' | 'kaleidoscope';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly exact: boolean;
}

export interface ProjectCatalogItem {
  readonly id: 'voynich' | 'kaleidoscope' | 'dmh-dev';
  readonly name: string;
  readonly menuTitle: string;
  readonly menuSubtitle: string;
  readonly path: string;
  readonly externalUrl?: string;
  readonly urlLabel: string;
  readonly description: string;
  readonly tags: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class ShellContextService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);

  readonly currentPath = signal<string>(this.location.path() || this.router.url || '/');
  readonly voynichVersion = VOYNICH_VERSION;

  readonly appMode = computed<ShellAppMode>(() => {
    const url = this.currentPath();
    if (url.startsWith('/voynich')) {
      return 'voynich';
    }
    if (url.startsWith('/kaleidoscope')) {
      return 'kaleidoscope';
    }
    return 'main';
  });

  readonly isWideLayout = computed(() => this.appMode() === 'voynich');
  readonly isFullBleed = computed(() => this.appMode() === 'kaleidoscope');

  readonly voynichNavItems: readonly NavItem[] = [
    { path: '/voynich', label: 'Overview', exact: true },
    { path: '/voynich/walkthroughs', label: 'Walkthroughs', exact: false },
    { path: '/voynich/identifications', label: 'Identifications', exact: false },
    { path: '/voynich/library', label: 'Library', exact: false },
    { path: '/voynich/folios', label: 'Folios', exact: false },
    { path: '/voynich/grammar', label: 'Grammar', exact: false },
  ];

  readonly projects: readonly ProjectCatalogItem[] = [
    {
      id: 'voynich',
      name: 'Voynich Manuscript Explorer',
      menuTitle: 'Voynich Manuscript',
      menuSubtitle: 'Corpus explorer, word decoder, and research archive',
      path: '/voynich',
      urlLabel: 'dmh.dev/voynich',
      description:
        'Visual, linguistic, and computational research explorer for Beinecke MS 408 with a 3-step word analyzer, folio walkthroughs, botanical and astronomical cribs, and the full 227-folio corpus.',
      tags: ['Research', 'Linguistics', 'Interactive Corpus'],
    },
    {
      id: 'kaleidoscope',
      name: 'Kaleidoscope',
      menuTitle: 'Kaleidoscope',
      menuSubtitle: 'Generative WebGL fractal and cherry-blossom shader',
      path: '/kaleidoscope',
      urlLabel: 'dmh.dev/kaleidoscope',
      description:
        'Interactive WebGL shader kaleidoscope blending psychedelic fractal symmetry with sakura cherry blossom geometry and harmonic color palettes.',
      tags: ['WebGL', 'GLSL Shader', 'Interactive'],
    },
    {
      id: 'dmh-dev',
      name: 'dmh.dev',
      menuTitle: 'dmh.dev Source',
      menuSubtitle: 'Angular 22 + SSR personal platform on GitHub',
      path: '/',
      externalUrl: 'https://github.com/d2kx/dmh.dev',
      urlLabel: 'github.com/d2kx/dmh.dev',
      description:
        'Personal website, blog, and unified web application featuring a custom Sakura-accented light and dark theme and accessible typography.',
      tags: ['TypeScript', 'Angular', 'Material 3'],
    },
  ];

  readonly menuProjects = computed(() =>
    this.projects.filter((p) => p.id === 'voynich' || p.id === 'kaleidoscope'),
  );

  // Kaleidoscope HUD state in top toolbar
  readonly kaleidoscopeStatsVisible = signal(false);
  readonly kaleidoscopeFps = signal(60);
  readonly kaleidoscopeFrameTimeMs = signal('16.7');
  readonly kaleidoscopeSparklineLine = signal('0,10 64,10');
  readonly kaleidoscopeSparklineFill = signal('0,20 0,10 64,10 64,20');
  readonly kaleidoscopeFullscreen = signal(false);
  readonly kaleidoscopeIdle = signal(false);

  private readonly fpsHistory: number[] = new Array<number>(24).fill(60);

  constructor() {
    this.currentPath.set(this.location.path() || this.router.url || '/');
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath.set(event.urlAfterRedirects || event.url);
      });

    const doc = this.document;
    doc.addEventListener?.('fullscreenchange', () => {
      this.kaleidoscopeFullscreen.set(Boolean(doc.fullscreenElement));
    });
  }

  toggleKaleidoscopeStats(): void {
    this.kaleidoscopeStatsVisible.update((v) => !v);
  }

  toggleFullscreen(): void {
    const doc = this.document;
    if (!doc.fullscreenElement) {
      doc.documentElement.requestFullscreen?.().catch(() => undefined);
    } else {
      doc.exitFullscreen?.().catch(() => undefined);
    }
  }

  updateKaleidoscopeStats(fps: number, frameTimeMs: number): void {
    if (!this.kaleidoscopeStatsVisible()) {
      return;
    }
    this.kaleidoscopeFps.set(fps);
    this.kaleidoscopeFrameTimeMs.set(frameTimeMs.toFixed(1));

    this.fpsHistory.push(Math.max(10, Math.min(120, fps)));
    if (this.fpsHistory.length > 24) {
      this.fpsHistory.shift();
    }

    const width = 64;
    const height = 20;
    const maxFps = Math.max(65, ...this.fpsHistory);
    const points = this.fpsHistory.map((val, idx) => {
      const x = (idx / (this.fpsHistory.length - 1)) * width;
      const norm = Math.min(1, Math.max(0, val / maxFps));
      const y = height - 3 - norm * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePts = points.join(' ');
    this.kaleidoscopeSparklineLine.set(linePts);
    this.kaleidoscopeSparklineFill.set(`0,${height} ${linePts} ${width},${height}`);
  }
}
