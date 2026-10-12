import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { renderMarkdownToHtml } from './voynich-decoder';
import { VOYNICH_VERSION } from './voynich-version';
import { CatalogData, CorpusData, DocFull, ExplorerData } from './voynich.model';

@Injectable({ providedIn: 'root' })
export class VoynichService {
  private readonly http = inject(HttpClient);

  readonly version = VOYNICH_VERSION;
  readonly explorerData = signal<ExplorerData | null>(null);
  readonly catalogData = signal<CatalogData | null>(null);
  readonly corpusData = signal<CorpusData | null>(null);
  readonly readersGuideHtml = signal<string>('');
  readonly lightboxUrl = signal<string | null>(null);

  // Shared active word for the interactive morphological decoder
  readonly activeWord = signal<string>('qokeedy');

  private initPromise: Promise<void> | null = null;
  private corpusPromise: Promise<CorpusData> | null = null;
  private readonly docCache = new Map<string, DocFull>();

  ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = Promise.all([
      firstValueFrom(this.http.get<ExplorerData>('/content/voynich/explorer-data.json')),
      firstValueFrom(this.http.get<CatalogData>('/content/voynich/catalog.json')),
      this.loadDoc('plain-english-visual-readers-guide'),
    ])
      .then(([explorer, catalog, guideDoc]) => {
        this.explorerData.set(explorer);
        this.catalogData.set(catalog);
        this.readersGuideHtml.set(renderMarkdownToHtml(guideDoc.markdown));
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
        this.http.get<CorpusData>('/content/voynich/folios-corpus.json'),
      ).then((data) => {
        this.corpusData.set(data);
        return data;
      });
    }
    return this.corpusPromise;
  }

  async loadDoc(slug: string): Promise<DocFull> {
    const cached = this.docCache.get(slug);
    if (cached) {
      return cached;
    }
    const doc = await firstValueFrom(
      this.http.get<DocFull>(`/content/voynich/docs/${encodeURIComponent(slug)}.json`),
    );
    this.docCache.set(slug, doc);
    return doc;
  }

  async loadDataFileText(url: string): Promise<string> {
    return firstValueFrom(this.http.get(url, { responseType: 'text' }));
  }

  openLightbox(url: string): void {
    this.lightboxUrl.set(url);
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
  }
}
