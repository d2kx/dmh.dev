import {
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
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
  imports: [RouterLink],
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

  protected readonly activeSection = signal<VoynichSection>('overview');
  protected readonly librarySubtab = signal<LibrarySubtab>('docs');

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

  // Walkthroughs master-detail state
  protected readonly selectedWalkthroughIdx = signal<number>(0);
  protected readonly activeWalkthrough = computed<WalkthroughFolio | null>(() => {
    const folios = this.voynich.explorerData()?.folios ?? [];
    return folios[this.selectedWalkthroughIdx()] ?? folios[0] ?? null;
  });

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

  // Library state (Markdown Guides, Datasets, Scans)
  protected readonly docSearch = signal<string>('');
  protected readonly activeDocSlug = signal<string>('plain-english-visual-readers-guide');
  protected readonly activeDocTitle = signal<string>("Plain-English Visual Reader's Guide");
  protected readonly activeDocMeta = signal<string>(
    'notes/PLAIN_ENGLISH_VISUAL_READERS_GUIDE.md · 1. Start Here: Plain-English & Visual Guides',
  );
  protected readonly activeDocHtml = signal<SafeHtml>('');

  protected readonly groupedDocs = computed<readonly { category: string; docs: DocMeta[] }[]>(
    () => {
      const cat = this.voynich.catalogData();
      if (!cat) return [];
      const q = this.docSearch().trim().toLowerCase();
      const filtered = cat.docs.filter(
        (d) =>
          !q ||
          d.title.toLowerCase().includes(q) ||
          d.slug.includes(q) ||
          d.category.toLowerCase().includes(q),
      );
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

  protected readonly dataSearch = signal<string>('');
  protected readonly activeDataFile = signal<string>('');
  protected readonly activeDataMeta = signal<string>('');
  protected readonly activeDataRawUrl = signal<string>('');
  protected readonly activeDataPreview = signal<string>(
    'Click any dataset on the left to inspect its contents.',
  );

  protected readonly filteredDataFiles = computed(() => {
    const cat = this.voynich.catalogData();
    if (!cat) return [];
    const q = this.dataSearch().trim().toLowerCase();
    return cat.dataFiles.filter(
      (df) => !q || df.file.toLowerCase().includes(q) || df.label.toLowerCase().includes(q),
    );
  });

  protected readonly scanSearch = signal<string>('');
  protected readonly filteredScans = computed(() => {
    const cat = this.voynich.catalogData();
    if (!cat) return [];
    const q = this.scanSearch().trim().toLowerCase();
    return cat.pages.filter(
      (p) => !q || p.file.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q),
    );
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const raw = (params.get('section') || 'overview').toLowerCase() as VoynichSection;
      const section: VoynichSection = VALID_SECTIONS.has(raw) ? raw : 'overview';
      this.activeSection.set(section);
      if (section === 'folios') {
        void this.voynich.ensureCorpusLoaded();
      }
      if (section === 'library' && !this.activeDocHtml()) {
        void this.selectDoc(this.activeDocSlug());
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
      void this.voynich.ensureInitialized().then(() => {
        const wt = this.route.snapshot.queryParamMap.get('walkthrough');
        if (wt) {
          this.selectWalkthroughByFolio(wt);
        }
        if (this.activeSection() === 'library' && !this.activeDocHtml()) {
          void this.selectDoc(this.activeDocSlug());
        }
      });
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

  private selectWalkthroughByFolio(folioId: string): void {
    const folios = this.voynich.explorerData()?.folios ?? [];
    const idx = folios.findIndex((f) => f.folio === folioId || f.folio.startsWith(folioId));
    if (idx >= 0) {
      this.selectedWalkthroughIdx.set(idx);
    }
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
    if (s.length > 52 && /(?<!\d),\s+/.test(s)) {
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
    const firstPart = (tok || '').trim().split(/[\s(/]+/)[0] || '';
    return firstPart.replace(/[^a-zA-Z0-9]/g, '');
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

  protected async selectDoc(slug: string): Promise<void> {
    this.activeDocSlug.set(slug);
    this.librarySubtab.set('docs');
    try {
      const { doc, html } = await this.voynich.loadDoc(slug);
      this.activeDocTitle.set(doc.title);
      this.activeDocMeta.set(`${doc.sourcePath} · ${doc.category} · ${doc.sizeKB} KB`);
      this.activeDocHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
    } catch {
      // Ignore missing doc slug
    }
  }

  protected async inspectDataFile(file: string, url: string, sizeKB: number): Promise<void> {
    this.activeDataFile.set(file);
    this.activeDataMeta.set(`${sizeKB} KB · /data/${file}`);
    this.activeDataRawUrl.set(url);
    this.activeDataPreview.set(`Loading /data/${file}…`);
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
      void this.router.navigate(['/voynich/library'], {
        queryParams: { subtab: 'docs', doc: slug },
      });
    }
  }
}
