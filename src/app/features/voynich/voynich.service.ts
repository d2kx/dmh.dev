import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { renderMarkdownToHtml } from './voynich-decoder';
import { VOYNICH_VERSION } from './voynich-version';
import { CatalogData, CorpusData, DocFull, ExplorerData } from './voynich.model';

export interface CachedDocResult {
  readonly doc: DocFull;
  readonly html: string;
}

@Injectable({ providedIn: 'root' })
export class VoynichService {
  private readonly http = inject(HttpClient);

  readonly version = VOYNICH_VERSION;
  readonly explorerData = signal<ExplorerData | null>(null);
  readonly catalogData = signal<CatalogData | null>(null);
  readonly corpusData = signal<CorpusData | null>(null);
  readonly lightboxUrl = signal<string | null>(null);

  // Shared active word for the interactive morphological decoder
  readonly activeWord = signal<string>('qokeedy');

  private initPromise: Promise<void> | null = null;
  private corpusPromise: Promise<CorpusData> | null = null;
  private readonly docCache = new Map<string, CachedDocResult>();
  private readonly dataTextCache = new Map<string, string>();

  private readonly cacheQuery = `?v=${VOYNICH_VERSION.shortSha}-4`;

  ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = Promise.all([
      firstValueFrom(
        this.http.get<ExplorerData>(`/content/voynich/explorer-data.json${this.cacheQuery}`),
      ),
      firstValueFrom(
        this.http.get<CatalogData>(`/content/voynich/catalog.json${this.cacheQuery}`),
      ),
    ])
      .then(([explorer, catalog]) => {
        this.explorerData.set(explorer);
        this.catalogData.set(catalog);
      })
      .catch(() => {
        this.initPromise = null;
      });

    return this.initPromise;
  }

  ensureCorpusLoaded(): Promise<CorpusData> {
    const existing = this.corpusData();
    if (existing) {
      return Promise.resolve(existing);
    }
    if (!this.corpusPromise) {
      this.corpusPromise = firstValueFrom(
        this.http.get<CorpusData>(`/content/voynich/folios-corpus.json${this.cacheQuery}`),
      ).then((data) => {
        this.corpusData.set(data);
        return data;
      });
    }
    return this.corpusPromise;
  }

  async loadDoc(slug: string): Promise<CachedDocResult> {
    const cached = this.docCache.get(slug);
    if (cached) {
      return cached;
    }
    const doc = await firstValueFrom(
      this.http.get<DocFull>(
        `/content/voynich/docs/${encodeURIComponent(slug)}.json${this.cacheQuery}`,
      ),
    );
    const entry: CachedDocResult = {
      doc,
      html: renderMarkdownToHtml(doc.markdown),
    };
    this.docCache.set(slug, entry);
    return entry;
  }

  async loadDataFileText(url: string): Promise<string> {
    const cached = this.dataTextCache.get(url);
    if (cached !== undefined) {
      return cached;
    }
    const text = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
    this.dataTextCache.set(url, text);
    return text;
  }

  openLightbox(url: string): void {
    const base = url.split('?')[0] || url;
    this.lightboxUrl.set(base);
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
  }

  rawPngUrl(url: string): string {
    const base = url.split('?')[0] || url;
    return `${base}?raw=1`;
  }

  optimizedFullUrl(url: string): string {
    const base = url.split('?')[0] || url;
    return base.startsWith('/pages/') ? `${base}?format=webp&w=1600` : base;
  }
}
