import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MediaMatcher } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';

export type ColorSchemeOverride = 'light' | 'dark' | null;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly platform = inject(Platform);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly storedOverride = signal<ColorSchemeOverride>(null);
  private readonly systemDark = signal(false);

  /** Currently rendered color scheme ('light' or 'dark'). */
  readonly resolvedScheme = computed<'light' | 'dark'>(() => {
    const override = this.storedOverride();
    if (override) {
      return override;
    }
    return this.systemDark() ? 'dark' : 'light';
  });

  /** Target scheme that toggling will switch to. */
  readonly nextScheme = computed<'light' | 'dark'>(() =>
    this.resolvedScheme() === 'dark' ? 'light' : 'dark',
  );

  constructor() {
    if (!this.platform.isBrowser) {
      return;
    }

    const darkQuery = this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
    this.systemDark.set(Boolean(darkQuery.matches));
    darkQuery.addEventListener?.('change', (event) => {
      this.systemDark.set(event.matches);
    });

    this.storedOverride.set(this.readStoredScheme());
    this.applyMetaContent(this.storedOverride());

    const win = this.document.defaultView;
    win?.addEventListener('storage', (event) => {
      if (event.key === 'color-scheme') {
        const next =
          event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
        this.storedOverride.set(next);
        this.applyMetaContent(next);
      }
    });
  }

  toggleScheme(): void {
    const target = this.nextScheme();
    const systemCurrent: 'light' | 'dark' = this.systemDark() ? 'dark' : 'light';

    if (target === systemCurrent) {
      this.storedOverride.set(null);
      this.writeStoredScheme(null);
      this.applyMetaContent(null);
    } else {
      this.storedOverride.set(target);
      this.writeStoredScheme(target);
      this.applyMetaContent(target);
    }

    void this.liveAnnouncer.announce(`Switched to ${target} theme`, 'polite');
  }

  private readStoredScheme(): ColorSchemeOverride {
    try {
      const val = localStorage.getItem('color-scheme');
      return val === 'light' || val === 'dark' ? val : null;
    } catch {
      return null;
    }
  }

  private writeStoredScheme(value: ColorSchemeOverride): void {
    try {
      if (value) {
        localStorage.setItem('color-scheme', value);
      } else {
        localStorage.removeItem('color-scheme');
      }
    } catch {
      // Ignore storage access errors in private/restricted contexts
    }
  }

  private applyMetaContent(value: ColorSchemeOverride): void {
    const meta = this.document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (meta) {
      meta.content = value ?? 'light dark';
    }
  }
}
