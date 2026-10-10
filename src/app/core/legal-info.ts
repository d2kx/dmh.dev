import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';

export type LegalLanguage = 'de' | 'en';

export interface LegalInfo {
  readonly name: string;
  readonly street: string;
  readonly postalCity: string;
  readonly countryDe: string;
  readonly countryEn: string;
  readonly email: string;
  readonly phone: string;
}

const DEFAULT_LEGAL_INFO: LegalInfo = {
  name: 'Dennis Martin Herbers',
  street: '',
  postalCity: '',
  countryDe: 'Deutschland',
  countryEn: 'Germany',
  email: 'dennis@dmh.dev',
  phone: '',
};

@Injectable({ providedIn: 'root' })
export class LegalInfoService {
  private readonly http = inject(HttpClient);
  private readonly platform = inject(Platform);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly infoSignal = signal<LegalInfo>(DEFAULT_LEGAL_INFO);
  private readonly langSignal = signal<LegalLanguage>('de');
  private loaded = false;

  readonly info = this.infoSignal.asReadonly();
  readonly lang = this.langSignal.asReadonly();

  setLanguage(language: LegalLanguage): void {
    this.langSignal.set(language);
    const message =
      language === 'de' ? 'Sprache auf Deutsch geändert' : 'Language switched to English';
    void this.liveAnnouncer.announce(message, 'polite');
  }

  ensureLoaded(): void {
    if (this.loaded || !this.platform.isBrowser) {
      return;
    }
    this.loaded = true;
    this.http.get<LegalInfo>('/api/legal-info').subscribe({
      next: (data) => {
        if (data && typeof data.name === 'string') {
          this.infoSignal.set({
            name: data.name || DEFAULT_LEGAL_INFO.name,
            street: data.street || '',
            postalCity: data.postalCity || '',
            countryDe: data.countryDe || DEFAULT_LEGAL_INFO.countryDe,
            countryEn: data.countryEn || DEFAULT_LEGAL_INFO.countryEn,
            email: data.email || DEFAULT_LEGAL_INFO.email,
            phone: data.phone || '',
          });
        }
      },
      error: () => {
        // Fallback to DEFAULT_LEGAL_INFO in static/offline environments
      },
    });
  }
}
