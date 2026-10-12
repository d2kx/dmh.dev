import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ParsedVoynichWord,
  glossEvaLine,
  parseVoynichWord,
} from './voynich-decoder';
import {
  BalneoEntry,
  CorpusFolio,
  DocMeta,
  SpecimenEntry,
  WalkthroughFolio,
} from './voynich.model';
import { VoynichService } from './voynich.service';

export type VoynichSection =
  | 'overview'
  | 'walkthroughs'
  | 'identifications'
  | 'library'
  | 'folios'
  | 'grammar';

export type LibrarySubtab = 'docs' | 'datasets' | 'scans';

export interface OverviewShowcaseCard {
  readonly folioId: string;
  readonly badge: string;
  readonly title: string;
  readonly image: string;
  readonly description: string;
}

const VALID_SECTIONS = new Set<VoynichSection>([
  'overview',
  'walkthroughs',
  'identifications',
  'library',
  'folios',
  'grammar',
]);

@Component({
  selector: 'app-voynich',
  imports: [
    RouterLink,
    NgOptimizedImage,
    ScrollingModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './voynich.html',
  styleUrl: './voynich.css',
  host: {
    '(click)': 'onHostClick($event)',
    '(document:keydown.escape)': 'voynich.closeLightbox()',
  },
})
export class Voynich {
  protected readonly voynich = inject(VoynichService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly virtualViewport = viewChild(CdkVirtualScrollViewport);

  protected readonly activeSection = signal<VoynichSection>('overview');
  protected readonly librarySubtab = signal<LibrarySubtab>('docs');

  // Angular Material Table column definitions for Grammar & Atlases
  protected readonly lexiconColumns: readonly string[] = [
    'stem',
    'category',
    'meaning',
    'examples',
    'sections',
    'grounding',
  ];
  protected readonly paradigmColumns: readonly string[] = [
    'case',
    'suffix',
    'form',
    'count',
    'gloss',
  ];
  protected readonly zodiacColumns: readonly string[] = [
    'folio',
    'sign',
    'month',
    'season',
    'ringWords',
    'nymphLabels',
    'oRate',
    'sampleLabels',
  ];
  protected readonly balneoColumns: readonly string[] = [
    'folio',
    'proseWords',
    'boilRate',
    'washRate',
    'vesselRate',
    'pipeLabels',
    'topWords',
  ];

  // Visual showcase cards on Overview introducing the manuscript's key sections
  protected readonly overviewShowcase: readonly OverviewShowcaseCard[] = [
    {
      folioId: 'f9v',
      badge: 'Herbal Section · f9v',
      title: 'Wild Pansy / Heartsease (Viola tricolor)',
      image: '/pages/f9v_viola_full_enh.png',
      description:
        'Full-page botanical paintings occupy the first half of the manuscript, pairing painted roots, leaves, and blossoms with structured preparation notes.',
    },
    {
      folioId: 'f68v3',
      badge: 'Astronomical Section · f68v3',
      title: '8-Arm Spiral Star Wheel & Zodiac Dials',
      image: '/pages/f68v3_spiral_star_wheel_enh.png',
      description:
        'Foldout star charts and 30-degree Zodiac wheels containing 15th-century European month names (mars through decembre) act as a seasonal timing calendar.',
    },
    {
      folioId: 'f75r',
      badge: 'Balneological Section · f75r',
      title: 'Waterfall Bathing Pool & Medicated Pipes',
      image: '/pages/f75r_waterfall_pool_enh.png',
      description:
        'Twenty pages of chutes, pipes, and immersion basins where painted conduits carry vessel labels (olkol, okoldy) and surrounding recipes prescribe boiling and bathing.',
    },
    {
      folioId: 'f89r2',
      badge: 'Pharmaceutical Section · f89r2',
      title: 'Apothecary Jar With Labeled Cut Roots',
      image: '/pages/f89r2_full_enh.png',
      description:
        'Painted storage jars sit beside dissected root and leaf cuttings (darary, okar, oror) that bridge the botanical herbals to the final starred recipe pages.',
    },
  ];

  // Word decoder state
  protected readonly quickChips: readonly { word: string; hint: string }[] = [
    { word: 'qokeedy', hint: 'boil thoroughly' },
    { word: 'oror', hint: 'alkanet root' },
    { word: 'doaro', hint: 'Pleiades' },
    { word: 'daiin', hint: 'take 1 dose' },
    { word: 'olkol', hint: 'pipe conduit' },
    { word: 'okoldy', hint: 'infused in jar' },
  ];

  protected readonly parsedWord = computed<ParsedVoynichWord | null>(() =>
    parseVoynichWord(this.voynich.activeWord()),
  );

  protected readonly activeWordConcordance = computed(() => {
    const exp = this.voynich.explorerData();
    const w = this.voynich.activeWord().trim().toLowerCase();
    if (!exp || !w) return null;
    return exp.wordConcordance[w] ?? null;
  });

  // Walkthroughs search & master-detail state
  protected readonly walkthroughSearch = signal<string>('');
  protected readonly selectedWalkthroughFolio = signal<string>('f1r');

  protected readonly filteredWalkthroughFolios = computed<readonly WalkthroughFolio[]>(() => {
    const folios = this.voynich.explorerData()?.folios ?? [];
    const q = this.walkthroughSearch().trim().toLowerCase();
    if (!q) return folios;
    return folios.filter(
      (f) =>
        f.folio.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.section.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        (f.labels ?? []).some((l) => l.toLowerCase().includes(q)) ||
        f.clauses.some(
          (c) => c.eva.toLowerCase().includes(q) || c.english.toLowerCase().includes(q),
        ),
    );
  });

  protected readonly activeWalkthrough = computed<WalkthroughFolio | null>(() => {
    const filtered = this.filteredWalkthroughFolios();
    const selected = this.selectedWalkthroughFolio();
    return filtered.find((f) => f.folio === selected) ?? filtered[0] ?? null;
  });

  protected readonly activeWalkthroughList = computed<readonly WalkthroughFolio[]>(() => {
    const w = this.activeWalkthrough();
    return w ? [w] : [];
  });

  // Identifications search & pagination state (20 specimens per page default)
  protected readonly specimenSearch = signal<string>('');
  protected readonly specimenPageIndex = signal<number>(0);
  protected readonly specimenPageSize = signal<number>(20);
  protected readonly specimenPageSizeOptions: readonly number[] = [10, 20, 35, 65];

  protected readonly filteredSpecimens = computed<readonly SpecimenEntry[]>(() => {
    const specimens = this.voynich.explorerData()?.specimens ?? [];
    const q = this.specimenSearch().trim().toLowerCase();
    if (!q) return specimens;
    return specimens.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.folio.toLowerCase().includes(q) ||
        s.common_name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q) ||
        s.plain_english_dossier.toLowerCase().includes(q) ||
        s.latin_candidates.some((l) => l.toLowerCase().includes(q)),
    );
  });

  protected readonly pagedSpecimens = computed<readonly SpecimenEntry[]>(() => {
    const all = this.filteredSpecimens();
    const size = this.specimenPageSize();
    const start = this.specimenPageIndex() * size;
    return all.slice(start, start + size);
  });

  private readonly scanDimsMap = computed<ReadonlyMap<string, { width: number; height: number }>>(
    () => {
      const pages = this.voynich.catalogData()?.pages ?? [];
      const map = new Map<string, { width: number; height: number }>();
      for (const p of pages) {
        map.set(p.file, { width: p.width, height: p.height });
      }
      return map;
    },
  );

  // Corpus 227-folio browser state
  protected readonly corpusSearch = signal<string>('');
  protected readonly corpusSectionFilter = signal<string>('');
  protected readonly corpusLangFilter = signal<string>('');
  protected readonly selectedCorpusFolioId = signal<string>('f1r');

  protected readonly filteredCorpusFolios = computed<readonly CorpusFolio[]>(() => {
    const corpus = this.voynich.corpusData();
    if (!corpus) return [];
    const q = this.corpusSearch().trim().toLowerCase();
    const sec = this.corpusSectionFilter();
    const lang = this.corpusLangFilter();

    return corpus.folios.filter((f) => {
      if (sec && f.sectionCode !== sec) return false;
      if (lang && f.lang !== lang) return false;
      if (!q) return true;
      return (
        f.folio.toLowerCase().includes(q) ||
        f.section.toLowerCase().includes(q) ||
        f.labels.some((l) => l.toLowerCase().includes(q))
      );
    });
  });

  protected readonly activeCorpusFolio = computed<CorpusFolio | null>(() => {
    const corpus = this.voynich.corpusData();
    if (!corpus) return null;
    const id = this.selectedCorpusFolioId();
    return corpus.folios.find((f) => f.folio === id) ?? corpus.folios[0] ?? null;
  });

  // Library state (Markdown Guides, Scans & PDF Books, Datasets)
  protected readonly docSearch = signal<string>('');
  protected readonly activeDocSlug = signal<string | null>(null);
  protected readonly activeDocTitle = signal<string>('');
  protected readonly activeDocMeta = signal<string>('');
  protected readonly activeDocHtml = signal<SafeHtml>('');

  protected readonly filteredDocs = computed<readonly DocMeta[]>(() => {
    const cat = this.voynich.catalogData();
    if (!cat) return [];
    const q = this.docSearch().trim().toLowerCase();
    if (!q) return cat.docs;
    return cat.docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.slug.includes(q) ||
        d.category.toLowerCase().includes(q),
    );
  });

  protected readonly groupedDocs = computed<readonly { category: string; docs: DocMeta[] }[]>(
    () => {
      const filtered = this.filteredDocs();
      const map = new Map<string, DocMeta[]>();
      for (const d of filtered) {
        const list = map.get(d.category) ?? [];
        list.push(d);
        map.set(d.category, list);
      }
      return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([category, docs]) => ({ category, docs }));
    },
  );

  // Datasets directory & full-width inspector state
  protected readonly dataSearch = signal<string>('');
  protected readonly dataPageIndex = signal<number>(0);
  protected readonly dataPageSize = signal<number>(36);
  protected readonly dataPageSizeOptions: readonly number[] = [18, 36, 72];
  protected readonly activeDataFile = signal<string>('');
  protected readonly activeDataMeta = signal<string>('');
  protected readonly activeDataRawUrl = signal<string>('');
  protected readonly activeDataPreview = signal<string>('');

  protected readonly filteredDataFiles = computed(() => {
    const cat = this.voynich.catalogData();
    if (!cat) return [];
    const q = this.dataSearch().trim().toLowerCase();
    return cat.dataFiles.filter(
      (df) => !q || df.file.toLowerCase().includes(q) || df.label.toLowerCase().includes(q),
    );
  });

  protected readonly pagedDataFiles = computed(() => {
    const all = this.filteredDataFiles();
    const size = this.dataPageSize();
    const start = this.dataPageIndex() * size;
    return all.slice(start, start + size);
  });

  // Scans & PDF Books gallery state
  protected readonly scanSearch = signal<string>('');
  protected readonly scanPageIndex = signal<number>(0);
  protected readonly scanPageSize = signal<number>(24);
  protected readonly scanPageSizeOptions: readonly number[] = [12, 24, 48];

  protected readonly filteredScans = computed(() => {
    const cat = this.voynich.catalogData();
    if (!cat) return [];
    const q = this.scanSearch().trim().toLowerCase();
    return cat.pages.filter(
      (p) => !q || p.file.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q),
    );
  });

  protected readonly pagedScans = computed(() => {
    const all = this.filteredScans();
    const size = this.scanPageSize();
    const start = this.scanPageIndex() * size;
    return all.slice(start, start + size);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const raw = (params.get('section') || 'overview').toLowerCase() as VoynichSection;
      const section: VoynichSection = VALID_SECTIONS.has(raw) ? raw : 'overview';
      this.activeSection.set(section);
      if (section !== 'overview') {
        void this.voynich.ensureInitialized();
      }
      if (section === 'folios') {
        void this.voynich.ensureCorpusLoaded();
      }
    });

    this.route.queryParamMap.subscribe((qParams) => {
      const subtab = qParams.get('subtab');
      if (subtab === 'docs' || subtab === 'datasets' || subtab === 'scans') {
        this.librarySubtab.set(subtab);
      }
      const docSlug = qParams.get('doc');
      if (docSlug) {
        void this.selectDoc(docSlug);
      } else if (this.activeDocSlug()) {
        this.activeDocSlug.set(null);
      }
      const folio = qParams.get('folio');
      if (folio) {
        this.selectedCorpusFolioId.set(folio);
        void this.voynich.ensureCorpusLoaded();
      }
      const wt = qParams.get('walkthrough');
      if (wt) {
        this.selectWalkthroughByFolio(wt);
      }
    });

    afterNextRender(() => {
      const initExplorer = () => {
        void this.voynich.ensureInitialized().then(() => {
          const wt = this.route.snapshot.queryParamMap.get('walkthrough');
          if (wt) {
            this.selectWalkthroughByFolio(wt);
          }
          const docSlug = this.route.snapshot.queryParamMap.get('doc');
          if (docSlug && !this.activeDocHtml()) {
            void this.selectDoc(docSlug);
          }
        });
      };

      if (this.activeSection() !== 'overview' || this.route.snapshot.queryParamMap.has('walkthrough')) {
        initExplorer();
      } else if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => initExplorer(), { timeout: 1200 });
      } else {
        setTimeout(() => initExplorer(), 400);
      }
    });
  }

  protected setWord(word: string): void {
    const cleaned = this.cleanToken(word);
    if (!cleaned) return;
    this.voynich.activeWord.set(cleaned);
    if (this.activeSection() !== 'overview') {
      void this.router.navigate(['/voynich']);
    }
  }

  protected openWalkthroughFolio(folioId: string): void {
    this.selectWalkthroughByFolio(folioId);
    void this.router.navigate(['/voynich/walkthroughs'], {
      queryParams: { walkthrough: folioId },
    });
  }

  protected selectWalkthroughByFolio(folioId: string): void {
    const folios = this.voynich.explorerData()?.folios ?? [];
    const match = folios.find((f) => f.folio === folioId || f.folio.startsWith(folioId));
    const targetFolio = match ? match.folio : folioId;
    this.selectedWalkthroughFolio.set(targetFolio);

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const idx = this.filteredWalkthroughFolios().findIndex((f) => f.folio === targetFolio);
        if (idx >= 0) {
          this.virtualViewport()?.scrollToIndex(Math.max(0, idx - 2), 'smooth');
        }
      }, 50);
    }
  }

  protected onWalkthroughSearch(value: string): void {
    this.walkthroughSearch.set(value);
  }

  protected trackByWalkthrough(_index: number, item: WalkthroughFolio): string {
    return item.folio;
  }

  protected trackByCorpusFolio(_index: number, item: CorpusFolio): string {
    return item.folio;
  }

  protected setLibrarySubtab(subtab: LibrarySubtab): void {
    this.librarySubtab.set(subtab);
    this.activeDocSlug.set(null);
    this.activeDataFile.set('');
    void this.router.navigate(['/voynich/library'], {
      queryParams: { subtab },
    });
  }

  protected shortDocTitle(doc: DocMeta): string {
    const overrides: Record<string, string> = {
      'plain-english-visual-readers-guide': "Plain-English Visual Reader's Guide",
      'visual-botanical-and-astro-identifications': 'Botanical & Astro Identification Dossier',
      readme: 'Project Overview (README)',
      'notes-master-research-log': 'Master Research Log & Findings',
      'drawing-intrusions-right-titles-and-25paragraph-reader':
        'Drawing Intrusions & 25-Paragraph Reader',
    };
    if (overrides[doc.slug]) {
      return overrides[doc.slug];
    }
    let s = doc.title
      .replace(/^Wave\s*\d+\s*Master\s*Compendium:\s*/i, '')
      .replace(/\s*\((?:Wave|Attack|Phase|Discover|\d|\{)[^)]*\)/gi, '')
      .replace(/^(?:The\s+)?(?:Complete\s+)?(?:Voynich\s+Manuscript\s+|Voynich\s+)?/i, '')
      .replace(/\s+(?:to|of)\s+the\s+Voynich\s+Manuscript/gi, '')
      .replace(/:\s+Complete\s+Morphological.*$/i, '')
      .replace(/\s+&\s+100\.00%-Accountability.*$/i, '')
      .replace(/\s+&\s+Multi-Paragraph\s+Monograph\s+Edition$/i, '')
      .replace(/\s+&\s+Circular\s+Ring\s+Decoder\s+Edition$/i, '')
      .replace(/\s+&\s+Decoded\s+Parallel\s+Clause\s+Corpus$/i, '')
      .replace(/\s+&\s+46-Core\s+Generative\s+Decoder$/i, '')
      .replace(/\s+&\s+Complete\s+.*$/i, '')
      .replace(/\s+&\s+Multi-Modal\s+.*$/i, '')
      .trim();
    if (s.length > 62 && /(?<!\d),\s+/.test(s)) {
      s = s.split(/(?<!\d),\s+/)[0].trim();
    }
    return s;
  }

  protected onWordInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.voynich.activeWord.set(val);
  }

  protected splitTokens(text: string): string[] {
    return (text || '')
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  protected cleanToken(tok: string): string {
    const firstPart = (tok || '').trim().split(/[\s(./]+/)[0] || '';
    return firstPart.replace(/[^a-zA-Z0-9]/g, '');
  }

  protected displayToken(tok: string): string {
    const firstPart = (tok || '').trim().split(/[\s(/]+/)[0] || '';
    return firstPart.replace(/[^a-zA-Z0-9.]/g, '');
  }

  protected openingWordNote(raw: string): string {
    const trimmed = (raw || '').trim();
    const firstPart = trimmed.split(/[\s(]+/)[0] || '';
    return trimmed.slice(firstPart.length).trim();
  }

  protected formatPercent(rate: number): string {
    return `${((rate || 0) * 100).toFixed(1)}%`;
  }

  protected combineBalneoLabels(b: BalneoEntry): string[] {
    return [...(b.nymph_labels ?? []), ...(b.tube_labels ?? [])].slice(0, 6);
  }

  protected formatLineGloss(eva: string): string {
    return glossEvaLine(eva);
  }

  protected jumpToCorpusFolio(folioId: string): void {
    const primaryId = (folioId || '').split(/\s+/)[0].trim();
    this.selectedCorpusFolioId.set(primaryId);
    void this.router.navigate(['/voynich/folios'], { queryParams: { folio: primaryId } });
  }

  protected openDoc(slug: string): void {
    void this.router.navigate(['/voynich/library'], {
      queryParams: { subtab: 'docs', doc: slug },
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected closeDocReader(): void {
    this.activeDocSlug.set(null);
    void this.router.navigate(['/voynich/library'], {
      queryParams: { subtab: 'docs' },
    });
  }

  protected async selectDoc(slug: string): Promise<void> {
    this.activeDocSlug.set(slug);
    this.librarySubtab.set('docs');
    try {
      const { doc, html } = await this.voynich.loadDoc(slug);
      this.activeDocTitle.set(doc.title);
      this.activeDocMeta.set(`${doc.sourcePath} · ${doc.category} · ${doc.sizeKB} KB`);
      this.activeDocHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
    } catch {
      if (typeof window !== 'undefined') {
        this.activeDocSlug.set(null);
      }
    }
  }

  protected async inspectDataFile(file: string, url: string, sizeKB: number): Promise<void> {
    this.activeDataFile.set(file);
    this.activeDataMeta.set(`${sizeKB} KB · /data/${file}`);
    this.activeDataRawUrl.set(url);
    this.activeDataPreview.set(`Loading /data/${file}…`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    try {
      const text = await this.voynich.loadDataFileText(url);
      this.activeDataPreview.set(
        text.length > 60000
          ? text.slice(0, 60000) + '\n\n… [Truncated in preview; click Open Raw File for full file]'
          : text,
      );
    } catch {
      this.activeDataPreview.set(`Could not load /data/${file}`);
    }
  }

  protected closeDataInspector(): void {
    this.activeDataFile.set('');
  }

  protected onDataSearch(value: string): void {
    this.dataSearch.set(value);
    this.dataPageIndex.set(0);
  }

  protected onDataPage(event: PageEvent): void {
    this.dataPageIndex.set(event.pageIndex);
    this.dataPageSize.set(event.pageSize);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected onScanSearch(value: string): void {
    this.scanSearch.set(value);
    this.scanPageIndex.set(0);
  }

  protected onScanPage(event: PageEvent): void {
    this.scanPageIndex.set(event.pageIndex);
    this.scanPageSize.set(event.pageSize);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected onSpecimenSearch(value: string): void {
    this.specimenSearch.set(value);
    this.specimenPageIndex.set(0);
  }

  protected onSpecimenPage(event: PageEvent): void {
    this.specimenPageIndex.set(event.pageIndex);
    this.specimenPageSize.set(event.pageSize);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected getScanDims(filename: string): { width: number; height: number } {
    return this.scanDimsMap().get(filename) ?? { width: 1500, height: 2000 };
  }

  protected shortConfidenceTier(tier: string): string {
    const m = (tier || '').match(/^(Tier\s+[A-Z+]+)/i);
    return m ? m[1] : tier;
  }

  protected onHostClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const zoomEl = target.closest<HTMLElement>('[data-zoom]');
    if (zoomEl?.dataset['zoom']) {
      event.preventDefault();
      this.voynich.openLightbox(zoomEl.dataset['zoom']);
      return;
    }

    const docEl = target.closest<HTMLElement>('[data-doc-slug]');
    if (docEl?.dataset['docSlug']) {
      event.preventDefault();
      const slug = docEl.dataset['docSlug'];
      this.openDoc(slug);
    }
  }
}
