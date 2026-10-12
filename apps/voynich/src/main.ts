import '@fontsource-variable/google-sans-flex';
import './style.css';
import versionMeta from './voynich-version.json';
import {
  escapeHtml,
  parseVoynichWord,
  renderMarkdownToHtml,
} from './voynich-decoder.ts';

interface WalkthroughClause {
  readonly locus: string;
  readonly eva: string;
  readonly english: string;
}

interface WalkthroughFolio {
  readonly folio: string;
  readonly title: string;
  readonly section: string;
  readonly pdf_page: number;
  readonly image: string;
  readonly secondary_image: string;
  readonly summary: string;
  readonly clauses: readonly WalkthroughClause[];
}

interface SpecimenItem {
  readonly id: string;
  readonly folio: string;
  readonly pdf_page: number;
  readonly common_name: string;
  readonly latin_candidates: readonly string[];
  readonly plain_english_dossier: string;
  readonly imageUrl: string;
  readonly voynich_stems: {
    readonly dominant_roots: readonly string[];
  };
}

interface LexiconStem {
  readonly stem: string;
  readonly category: string;
  readonly meaning: string;
  readonly examples: string;
  readonly sections: string;
  readonly grounding: string;
}

interface ParadigmCell {
  readonly top_form?: string;
  readonly count?: number;
}

interface ParadigmRow {
  readonly root: string;
  readonly semantic_class?: string;
  readonly gloss?: string;
  readonly total_tokens?: number;
  readonly cases?: Record<string, ParadigmCell>;
}

interface ZodiacMedallion {
  readonly folio: string;
  readonly sign: string;
  readonly european_month_gloss: string;
  readonly triplicity: string;
  readonly season: string;
  readonly ring_token_count: number;
  readonly nymph_label_count: number;
  readonly o_prefix_rate: number;
  readonly top_nymph_labels: readonly string[];
}

interface BalneoFolio {
  readonly folio: string;
  readonly prose_tokens: number;
  readonly thermal_boil_rate: number;
  readonly wash_bathe_rate: number;
  readonly pool_vessel_rate: number;
  readonly nymph_labels?: readonly string[];
  readonly tube_labels?: readonly string[];
  readonly top_prose_words?: readonly string[];
}

interface WordConcordanceEntry {
  readonly c: number;
  readonly f: readonly string[];
}

interface ExplorerData {
  readonly folios: readonly WalkthroughFolio[];
  readonly specimens: readonly SpecimenItem[];
  readonly lexicon: readonly LexiconStem[];
  readonly paradigms: readonly ParadigmRow[];
  readonly zodiac: readonly ZodiacMedallion[];
  readonly balneo: readonly BalneoFolio[];
  readonly wordConcordance: Record<string, WordConcordanceEntry>;
}

interface CorpusFolioLine {
  readonly locus: string;
  readonly tag: string;
  readonly eva: string;
}

interface CorpusFolio {
  readonly folio: string;
  readonly quire: string;
  readonly sectionCode: string;
  readonly section: string;
  readonly lang: string;
  readonly hand: string;
  readonly lineCount: number;
  readonly wordCount: number;
  readonly intrusionCount: number;
  readonly pdfPage: number | null;
  readonly beineckeId: string;
  readonly comments: readonly string[];
  readonly labels: readonly { readonly locus: string; readonly word: string }[];
  readonly titles: readonly { readonly locus: string; readonly words: readonly string[] }[];
  readonly scans: readonly string[];
  readonly lines: readonly CorpusFolioLine[];
}

interface DocMeta {
  readonly slug: string;
  readonly sourcePath: string;
  readonly title: string;
  readonly summary: string;
  readonly category: string;
  readonly pinnedOrder: number;
  readonly sizeKB: number;
}

interface PageScanEntry {
  readonly file: string;
  readonly url: string;
  readonly folio: string;
  readonly sizeKB: number;
  readonly isEnhanced: boolean;
}

interface DataFileEntry {
  readonly file: string;
  readonly url: string;
  readonly attackNum: number | null;
  readonly label: string;
  readonly ext: string;
  readonly sizeKB: number;
}

interface CatalogData {
  readonly docs: readonly DocMeta[];
  readonly pages: readonly PageScanEntry[];
  readonly dataFiles: readonly DataFileEntry[];
}

let explorerData: ExplorerData | null = null;
let catalogData: CatalogData | null = null;
let corpusFolios: readonly CorpusFolio[] | null = null;
const docCache = new Map<string, string>();

let activeWalkthroughIdx = 0;
let activeDocSlug = 'plain-english-visual-readers-guide';
let activeCorpusFolioId = 'f1r';

function getResolvedTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme(): void {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute('content', next);
  try {
    localStorage.setItem('dmh-theme', next);
  } catch {
    // Ignore storage errors
  }
  updateThemeButtonIcon();
}

function updateThemeButtonIcon(): void {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  const isDark = getResolvedTheme() === 'dark';
  const nextLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  btn.setAttribute('aria-label', nextLabel);
  btn.setAttribute('title', nextLabel);
  btn.innerHTML = isDark
    ? `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
    : `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
}

function renderShell(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const commitUrl = `${versionMeta.repoUrl}/tree/${versionMeta.commitSha}`;

  app.innerHTML = `
    <header class="site-header" role="banner">
      <div class="header-inner">
        <div class="brand-nav-group">
          <a href="/" class="brand-link" aria-label="voynich.dmh.dev home">
            <img src="/favicon.svg" alt="" width="30" height="30" class="brand-logo" />
            <span>voynich<span class="brand-domain">.dmh.dev</span></span>
          </a>

          <nav class="primary-nav" role="tablist" aria-label="Voynich Explorer Navigation">
            <button type="button" role="tab" class="nav-link-btn" aria-selected="true" data-tab="overview">
              Overview
            </button>
            <button type="button" role="tab" class="nav-link-btn" aria-selected="false" data-tab="walkthrough">
              Walkthroughs
            </button>
            <button type="button" role="tab" class="nav-link-btn" aria-selected="false" data-tab="specimens">
              Identifications
            </button>
            <button type="button" role="tab" class="nav-link-btn" aria-selected="false" data-tab="corpus">
              Folios
            </button>
            <button type="button" role="tab" class="nav-link-btn" aria-selected="false" data-tab="lexicon">
              Grammar
            </button>
            <button type="button" role="tab" class="nav-link-btn" aria-selected="false" data-tab="library">
              Library
            </button>
          </nav>
        </div>

        <div class="header-controls">
          <a
            href="${escapeHtml(commitUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="version-pill"
            title="Pinned to voynich-research commit ${escapeHtml(versionMeta.commitSha)} (${escapeHtml(versionMeta.commitDate)})"
          >
            <span class="version-dot" aria-hidden="true"></span>
            <span><code>${escapeHtml(versionMeta.shortSha)}</code> · ${escapeHtml(versionMeta.commitDate)}</span>
          </a>
          <a href="https://www.dmh.dev" class="parent-link">← dmh.dev</a>
          <button id="themeToggleBtn" type="button" class="theme-btn" aria-label="Toggle color theme"></button>
        </div>
      </div>
    </header>

    <main id="main-content" class="main-container" tabindex="-1">
      <!-- Clean Monochrome Morphological Word Analyzer -->
      <section class="decoder-dock" aria-labelledby="decoder-heading">
        <div class="decoder-top">
          <div class="decoder-title-group">
            <span class="decoder-title" id="decoder-heading">Morphological Word Analyzer</span>
            <code>Prefix + Root Stem + Suffix</code>
          </div>
          <span class="decoder-subtitle">
            Type any EVA word or click any word token in the folios below to inspect its structure:
          </span>
        </div>

        <div class="decoder-controls">
          <label for="wordInput" class="skip-link">Voynich EVA word to decode</label>
          <input
            id="wordInput"
            class="decoder-input"
            type="text"
            value="qokeedy"
            placeholder="Type EVA word (e.g. qokeedy)..."
            autocomplete="off"
            spellcheck="false"
          />
          <div class="sample-chips" aria-label="Sample Voynich words">
            <span>Examples:</span>
            ${[
              'qokeedy',
              'shedy',
              'olkol',
              'okoldy',
              'okar',
              'darary',
              'oror',
              'doaro',
              'otaly',
              'poldchody',
              'daiin',
              'otam',
            ]
              .map(
                (w) =>
                  `<button type="button" class="word-chip" data-word="${w}">${w}</button>`,
              )
              .join('')}
          </div>
        </div>

        <div id="legoOutput" class="morph-strip" aria-live="polite"></div>
        <div id="concordanceOutput" class="concordance-bar"></div>
      </section>

      <!-- TAB 1: OVERVIEW & CABINET OF SECTIONS -->
      <section id="panel-overview" class="view-panel active" aria-labelledby="overview-heading">
        <div class="section-hero">
          <p class="eyebrow">Beinecke MS 408 · Empirical &amp; Visual Investigation</p>
          <h1 id="overview-heading">Understanding the Voynich Manuscript in Plain English</h1>
          <p>
            Built directly from two complete digital scans of the codex and four cross-checked EVA
            transliterations (${versionMeta.stats.totalWords.toLocaleString('en-US')} word tokens across
            ${versionMeta.stats.transcribedFolios} folios). Explore the interactive page walkthroughs,
            visual identifications, the complete 227-folio corpus, or read the plain-English guide below.
          </p>

          <div class="stats-strip">
            <div class="stat-card">
              <div class="stat-value">${versionMeta.stats.transcribedFolios}</div>
              <div class="stat-label">Transcribed Folios (f1r to f116v)</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${versionMeta.stats.totalWords.toLocaleString('en-US')}</div>
              <div class="stat-label">Machine-Readable Word Tokens</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${versionMeta.stats.walkthroughFolios}</div>
              <div class="stat-label">Interactive Page Walkthroughs</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${versionMeta.stats.flagshipSpecimens}</div>
              <div class="stat-label">Botanical, Star &amp; Bath Cribs</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${versionMeta.stats.highResScans}</div>
              <div class="stat-label">High-Res Folio &amp; Detail Scans</div>
            </div>
          </div>
        </div>

        <!-- Curated Section Cards (dmh.dev + Cabinet of Wonders style) -->
        <div class="hub-grid" aria-label="Explore Sections">
          <button type="button" class="hub-card" data-jump-tab="walkthrough">
            <span class="hub-card-eyebrow">${versionMeta.stats.walkthroughFolios} Landmark Pages</span>
            <h2 class="hub-card-title">Page-by-Page Walkthroughs →</h2>
            <p class="hub-card-desc">
              Inspect high-resolution Yale Beinecke scans side-by-side with line-by-line EVA clauses and plain-English readings.
            </p>
          </button>

          <button type="button" class="hub-card" data-jump-tab="specimens">
            <span class="hub-card-eyebrow">${versionMeta.stats.flagshipSpecimens} Visual Cribs</span>
            <h2 class="hub-card-title">Visual Identifications →</h2>
            <p class="hub-card-desc">
              Botanical species, apothecary jars, the Pleiades star cluster (doaro), Zodiac month wheels, and bath plumbing labels.
            </p>
          </button>

          <button type="button" class="hub-card" data-jump-tab="corpus">
            <span class="hub-card-eyebrow">${versionMeta.stats.transcribedFolios} Folios · ${versionMeta.stats.totalWords.toLocaleString('en-US')} Words</span>
            <h2 class="hub-card-title">Complete Manuscript Corpus →</h2>
            <p class="hub-card-desc">
              Browse every folio from f1r to f116v, filter by manuscript section or Currier language (A/B), and inspect extracted scans.
            </p>
          </button>

          <button type="button" class="hub-card" data-jump-tab="lexicon">
            <span class="hub-card-eyebrow">Morphology &amp; Paradigms</span>
            <h2 class="hub-card-title">Root Dictionary &amp; Grammar →</h2>
            <p class="hub-card-desc">
              Explore physically grounded root stems, the 8-case inflectional paradigm matrix, 12 Zodiac wheels, and 20 bath pages.
            </p>
          </button>

          <button type="button" class="hub-card" data-jump-tab="library">
            <span class="hub-card-eyebrow">${versionMeta.stats.markdownGuides} Dossiers &amp; NOTES.md</span>
            <h2 class="hub-card-title">Research Library &amp; Datasets →</h2>
            <p class="hub-card-desc">
              Read all ${versionMeta.stats.markdownGuides} research compendiums and the chronological research log, or inspect ${versionMeta.stats.dataFiles} raw JSON/EVA datasets.
            </p>
          </button>

          <button type="button" class="hub-card" data-jump-subtab="scans">
            <span class="hub-card-eyebrow">${versionMeta.stats.highResScans} Extracted Plates</span>
            <h2 class="hub-card-title">High-Res Scan Gallery &amp; PDFs →</h2>
            <p class="hub-card-desc">
              Search all ${versionMeta.stats.highResScans} contrast-enhanced folio crops and download the two complete manuscript PDF editions.
            </p>
          </button>
        </div>

        <!-- Constrained 66ch Editorial Reading Column -->
        <article class="editorial-card">
          <div id="overviewGuideBody" class="markdown-body">
            <p>Loading Plain-English Visual Reader's Guide…</p>
          </div>
        </article>
      </section>

      <!-- TAB 2: PAGE WALKTHROUGHS -->
      <section id="panel-walkthrough" class="view-panel" aria-labelledby="walkthrough-heading">
        <div class="section-hero">
          <p class="eyebrow">Side-by-Side Scans &amp; Clause Breakdown</p>
          <h2 id="walkthrough-heading">${versionMeta.stats.walkthroughFolios} Iconic Manuscript Page Walkthroughs</h2>
          <p>
            Select any landmark folio on the left to inspect its high-resolution Yale Beinecke scan
            alongside clickable EVA clauses and plain-English readings. Click any scan to zoom in full screen.
          </p>
        </div>

        <div class="split-layout">
          <div class="sidebar-card" id="walkthroughList" aria-label="Landmark Folios"></div>
          <div class="detail-card" id="walkthroughViewer"></div>
        </div>
      </section>

      <!-- TAB 3: VISUAL IDENTIFICATIONS -->
      <section id="panel-specimens" class="view-panel" aria-labelledby="specimens-heading">
        <div class="section-hero">
          <p class="eyebrow">Botanical, Astronomical, Balneological &amp; Apothecary Cribs</p>
          <h2 id="specimens-heading">${versionMeta.stats.flagshipSpecimens} Flagship Visual Identifications</h2>
          <p>
            Matching the manuscript's plant paintings, apothecary jars, star clusters (Pleiades = <code>doaro</code>),
            bilingual Zodiac month wheels (<code>mars..decembre</code>), and labelled bath pipes (<code>olkol/okoldy</code>)
            to concrete 15th-century European sources.
          </p>
        </div>
        <div id="specimensGrid" class="cards-grid"></div>
      </section>

      <!-- TAB 4: FULL 227-FOLIO CORPUS & SCAN BROWSER -->
      <section id="panel-corpus" class="view-panel" aria-labelledby="corpus-heading">
        <div class="section-hero">
          <p class="eyebrow">Complete Manuscript Transliteration &amp; Scan Index</p>
          <h2 id="corpus-heading">All ${versionMeta.stats.transcribedFolios} Folios &amp; ${versionMeta.stats.totalWords.toLocaleString('en-US')} Words Browser</h2>
          <p>
            Filter by manuscript section or Currier language (A/B), or search for any folio
            or EVA word across the entire Voynich Manuscript. Click any word on any line to decode it above.
          </p>
        </div>

        <div class="split-layout">
          <div class="sidebar-card">
            <label for="corpusSearchInput" class="skip-link">Search folios or EVA words</label>
            <input
              id="corpusSearchInput"
              type="search"
              class="sidebar-filter"
              placeholder="Filter folio (e.g. f76r, f89r2) or word..."
            />
            <div class="sidebar-select-row">
              <select id="corpusSectionFilter" class="sidebar-select" aria-label="Filter by manuscript section">
                <option value="">All Sections</option>
                <option value="Herbal">Herbal</option>
                <option value="Astronomical">Astronomical</option>
                <option value="Zodiac">Zodiac</option>
                <option value="Biological">Balneological (Baths)</option>
                <option value="Pharmaceutical">Pharmaceutical</option>
                <option value="Cosmological">Cosmological / Rosettes</option>
                <option value="Text-only">Text-Only / Starred Recipes</option>
              </select>
              <select id="corpusLangFilter" class="sidebar-select" aria-label="Filter by Currier language">
                <option value="">All Languages</option>
                <option value="A">Language A</option>
                <option value="B">Language B</option>
              </select>
            </div>
            <div id="corpusFolioList" aria-label="Matching Manuscript Folios"></div>
          </div>
          <div class="detail-card" id="corpusFolioViewer">
            <p>Loading 227-folio corpus…</p>
          </div>
        </div>
      </section>

      <!-- TAB 5: ROOT DICTIONARY, 8-CASE GRAMMAR, ZODIAC & BATHS -->
      <section id="panel-lexicon" class="view-panel" aria-labelledby="lexicon-heading">
        <div class="section-hero">
          <p class="eyebrow">Morphology, Inflectional Paradigm &amp; Structural Matrices</p>
          <h2 id="lexicon-heading">Root Dictionary, 8-Case Grammar, Zodiac &amp; Bath Atlas</h2>
          <p>
            How the same root stem takes different prefixes and suffixes across the 8-case paradigm,
            alongside the 12 Zodiac month wheels and the 20-page Balneological plumbing atlas.
          </p>
        </div>

        <div class="detail-card" style="margin-bottom:1.5rem;">
          <h3 style="margin-top:0;">1. Physically Grounded Core Root Stems</h3>
          <div class="table-wrap">
            <table id="lexiconTable">
              <thead>
                <tr>
                  <th>Root Stem</th>
                  <th>Category</th>
                  <th>Plain-English Meaning</th>
                  <th>Inflected Examples (Click to Decode)</th>
                  <th>Visual &amp; Physical Grounding in the Scans</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <h3>2. The 8-Case Inflectional Paradigm Matrix (Top 20 Stems Across 38,949 Words)</h3>
          <div class="table-wrap">
            <table id="paradigmTable">
              <thead>
                <tr>
                  <th>Canonical Root</th>
                  <th>Semantic Role</th>
                  <th>Total Hits</th>
                  <th>NOM (Base)</th>
                  <th>GEN/PART (<code>-aiin</code>)</th>
                  <th>LOC (<code>-ol/-or</code>)</th>
                  <th>INST (<code>-al/-ar</code>)</th>
                  <th>PROC (<code>-edy/-dy</code>)</th>
                  <th>TERM (<code>-am/-m</code>)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <h3>3. The 12 Zodiac Wheels (f70v2 to f73v) &amp; Bilingual Month Glosses</h3>
          <div class="table-wrap">
            <table id="zodiacTable">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Zodiac Medallion</th>
                  <th>European Month Gloss</th>
                  <th>Element Triplicity</th>
                  <th>Ring Words</th>
                  <th>Star-Nymph Labels</th>
                  <th><code>o-</code> Nominal Rate</th>
                  <th>Top Degree Labels (Click to Decode)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <h3>4. The 20-Page Balneological Plumbing &amp; Label Atlas (f75r to f84v)</h3>
          <div class="table-wrap">
            <table id="balneoTable">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Prose Words</th>
                  <th>Thermal Boil Rate (<code>qokeedy</code>)</th>
                  <th>Wash/Bathe Rate (<code>shedy</code>)</th>
                  <th>Pool/Vessel Rate (<code>ol-</code>)</th>
                  <th>Pipe &amp; Nymph Labels (Click to Decode)</th>
                  <th>Top Prose Words (Click to Decode)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB 6: COMPLETE RESEARCH LIBRARY & HARD DATA -->
      <section id="panel-library" class="view-panel" aria-labelledby="library-heading">
        <div class="section-hero">
          <p class="eyebrow">Complete Dossiers, Chronological Research Log (NOTES.md), ${versionMeta.stats.dataFiles} Datasets &amp; 2 PDF Books</p>
          <h2 id="library-heading">Research Library, High-Res Scan Gallery &amp; Hard Data</h2>
          <p>
            Read all ${versionMeta.stats.markdownGuides} human-readable guides and synthesis compendiums (including the
            complete chronological research log <code>NOTES.md</code>), download the two full
            manuscript PDFs, or inspect any of the ${versionMeta.stats.dataFiles} raw JSON/EVA datasets and ${versionMeta.stats.highResScans} extracted scans.
          </p>
          <div class="subtab-bar">
            <button type="button" class="tab-btn" aria-selected="true" data-subtab="docs">
              Markdown Research Library (${versionMeta.stats.markdownGuides} Docs)
            </button>
            <button type="button" class="tab-btn" aria-selected="false" data-subtab="datasets">
              Hard Data, PDF Books &amp; ${versionMeta.stats.dataFiles} JSON Datasets
            </button>
            <button type="button" class="tab-btn" aria-selected="false" data-subtab="scans">
              All ${versionMeta.stats.highResScans} Extracted Folio &amp; Detail Scans
            </button>
          </div>
        </div>

        <!-- Subtab A: Markdown Guides & NOTES.md -->
        <div id="subpanel-docs" class="split-layout">
          <div class="sidebar-card">
            <label for="docSearchInput" class="skip-link">Search research guides</label>
            <input
              id="docSearchInput"
              type="search"
              class="sidebar-filter"
              placeholder="Filter ${versionMeta.stats.markdownGuides} guides &amp; NOTES.md..."
            />
            <div id="docsSidebarList"></div>
          </div>
          <div class="editorial-card">
            <div id="docViewerHeader" style="max-width:66ch;margin:0 auto 1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-subtle);"></div>
            <div id="docViewerBody" class="markdown-body"></div>
          </div>
        </div>

        <!-- Subtab B: PDF Books & JSON/EVA Datasets -->
        <div id="subpanel-datasets" style="display:none;">
          <div class="detail-card" style="margin-bottom:1.5rem;">
            <h3 style="margin-top:0;">Full Voynich Manuscript Digital PDF Editions (Git LFS)</h3>
            <div id="booksGrid" class="cards-grid"></div>
          </div>

          <div class="split-layout">
            <div class="sidebar-card">
              <label for="dataSearchInput" class="skip-link">Search ${versionMeta.stats.dataFiles} data files</label>
              <input
                id="dataSearchInput"
                type="search"
                class="sidebar-filter"
                placeholder="Filter ${versionMeta.stats.dataFiles} JSON &amp; EVA files (e.g. attack154, ZL3b)..."
              />
              <div id="dataFilesList"></div>
            </div>
            <div class="detail-card" id="dataFileViewer">
              <h3 style="margin-top:0;">Interactive Dataset Inspector</h3>
              <p style="color:var(--text-muted);">
                Select any of the ${versionMeta.stats.dataFiles} computational JSON outputs or EVA transliteration files on the left
                to inspect its contents or download the raw file.
              </p>
            </div>
          </div>
        </div>

        <!-- Subtab C: All High-Res Folio Scans -->
        <div id="subpanel-scans" style="display:none;">
          <div class="detail-card">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;">
              <h3 style="margin:0;">All ${versionMeta.stats.highResScans} Extracted &amp; Contrast-Enhanced Folio Scans</h3>
              <input
                id="scanGallerySearch"
                type="search"
                class="sidebar-filter"
                style="max-width:20rem;margin:0;"
                placeholder="Filter scan by folio (e.g. f89r2, f116v, f68r3)..."
              />
            </div>
            <div id="scansGalleryGrid" class="cards-grid"></div>
          </div>
        </div>
      </section>
    </main>

    <!-- Fullscreen Image Zoom Lightbox -->
    <div id="lightboxModal" class="lightbox-backdrop" hidden role="dialog" aria-modal="true" aria-label="High-resolution manuscript scan preview">
      <img id="lightboxImg" class="lightbox-img" src="" alt="High-resolution Voynich manuscript scan" />
      <div class="lightbox-bar">
        <span id="lightboxCaption"></span>
        <a id="lightboxNewTab" href="#" target="_blank" rel="noopener noreferrer" style="color:#ffd4e4;font-weight:650;">Open Original PNG ↗</a>
        <button id="lightboxCloseBtn" type="button" class="lightbox-close">Close (Esc)</button>
      </div>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>voynich.dmh.dev</strong> · Dennis Martin Herbers · Synced with
          <a href="${escapeHtml(commitUrl)}" target="_blank" rel="noopener noreferrer">
            d2kx/voynich-research@${escapeHtml(versionMeta.shortSha)}
          </a>
          (${escapeHtml(versionMeta.commitDate)})
        </div>
        <nav aria-label="Legal and repository links">
          <ul class="footer-links">
            <li><a href="https://www.dmh.dev">dmh.dev Home</a></li>
            <li><a href="${escapeHtml(versionMeta.repoUrl)}" target="_blank" rel="noopener noreferrer">GitHub Repo (voynich-research)</a></li>
            <li><a href="https://www.dmh.dev/impressum">Impressum / Legal Notice</a></li>
            <li><a href="https://www.dmh.dev/privacy">Datenschutz / Privacy</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  `;

  updateThemeButtonIcon();
}

function updateDecoderUI(rawWord: string): void {
  const input = document.getElementById('wordInput') as HTMLInputElement | null;
  if (input && input.value !== rawWord) {
    input.value = rawWord;
  }
  const out = document.getElementById('legoOutput');
  const concOut = document.getElementById('concordanceOutput');
  if (!out || !concOut) return;

  const parsed = parseVoynichWord(rawWord);
  if (!parsed) {
    out.innerHTML = '';
    concOut.innerHTML = '';
    return;
  }

  out.innerHTML = `
    <div class="morph-segment">
      <div class="morph-role">1. Prefix (Left Role)</div>
      <div class="morph-token">${escapeHtml(parsed.prefix)}</div>
      <div class="morph-meaning">${escapeHtml(parsed.prefixDesc)}</div>
    </div>
    <div class="morph-segment">
      <div class="morph-role">2. Core Root Stem</div>
      <div class="morph-token">${escapeHtml(parsed.stem)}</div>
      <div class="morph-meaning">${escapeHtml(parsed.stemDesc)}</div>
    </div>
    <div class="morph-segment">
      <div class="morph-role">3. Suffix (Right Ending)</div>
      <div class="morph-token">${escapeHtml(parsed.suffix)}</div>
      <div class="morph-meaning">${escapeHtml(parsed.suffixDesc)}</div>
    </div>
    <div class="morph-segment">
      <div class="morph-role">Plain-English Reading (${escapeHtml(parsed.word)})</div>
      <div class="morph-token">${escapeHtml(parsed.gloss)}</div>
      <div class="morph-meaning">Click any word token in the folios below to compare</div>
    </div>
  `;

  const cleanKey = rawWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const conc = explorerData?.wordConcordance?.[cleanKey];
  if (conc) {
    const folioBtns = conc.f
      .map(
        (f) =>
          `<button type="button" class="folio-jump-btn" data-jump-folio="${escapeHtml(f)}" title="Inspect folio ${escapeHtml(f)} in the 227-Folio Corpus">${escapeHtml(f)}</button>`,
      )
      .join('');
    concOut.innerHTML = `
      <span><strong>Corpus Concordance:</strong> <code>${escapeHtml(cleanKey)}</code> appears <strong>${conc.c.toLocaleString('en-US')}×</strong> across the manuscript. Sample folios:</span>
      ${folioBtns}
    `;
  } else {
    concOut.innerHTML = `<span><strong>Corpus Concordance:</strong> Morphological decomposition active for <code>${escapeHtml(rawWord.trim())}</code>.</span>`;
  }
}

function switchTab(tabId: string): void {
  document.querySelectorAll<HTMLButtonElement>('.primary-nav .nav-link-btn').forEach((btn) => {
    const isMatch = btn.dataset.tab === tabId;
    btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });
  document.querySelectorAll<HTMLElement>('.view-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${tabId}`);
  });

  if (tabId === 'walkthrough') {
    renderWalkthroughs();
  }
  if (tabId === 'specimens') {
    renderSpecimens();
  }
  if (tabId === 'corpus' && !corpusFolios) {
    void ensureCorpusLoaded();
  }
  if (tabId === 'library') {
    void loadAndRenderDoc(activeDocSlug);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderWalkthroughs(): void {
  if (!explorerData) return;
  const listEl = document.getElementById('walkthroughList');
  if (!listEl) return;

  listEl.innerHTML = explorerData.folios
    .map(
      (f, idx) => `
      <button type="button" class="nav-item-btn ${idx === activeWalkthroughIdx ? 'active' : ''}" data-walkthrough-idx="${idx}">
        <strong>Folio ${escapeHtml(f.folio)} (p.${f.pdf_page})</strong>
        <span>${escapeHtml(f.title)}</span>
      </button>
    `,
    )
    .join('');

  renderWalkthroughDetail(activeWalkthroughIdx);
}

function renderWalkthroughDetail(idx: number): void {
  if (!explorerData) return;
  activeWalkthroughIdx = idx;
  const f = explorerData.folios[idx];
  const viewer = document.getElementById('walkthroughViewer');
  if (!viewer || !f) return;

  document.querySelectorAll<HTMLButtonElement>('#walkthroughList .nav-item-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.walkthroughIdx) === idx);
  });

  const clausesHtml = f.clauses
    .map((c) => {
      const tokens = c.eva
        .split(/\s+/)
        .map((t) => {
          const clean = t.replace(/[^a-zA-Z0-9]/g, '');
          return `<button type="button" class="word-chip" data-word="${escapeHtml(clean)}">${escapeHtml(t)}</button>`;
        })
        .join('');
      return `
        <div class="clause-box">
          <div class="clause-locus">${escapeHtml(c.locus)} · Click any Voynich word to decode it above:</div>
          <div class="clause-tokens">${tokens}</div>
          <div class="clause-reading"><strong>Plain-English Reading:</strong> ${escapeHtml(c.english)}</div>
        </div>
      `;
    })
    .join('');

  const secondScanHtml = f.secondary_image
    ? `
      <figure class="scan-figure">
        <img src="${escapeHtml(f.secondary_image)}" alt="Detail crop for ${escapeHtml(f.folio)}" width="640" height="850" decoding="async" data-zoom="${escapeHtml(f.secondary_image)}" />
        <figcaption class="scan-caption">
          <span>Detail crop · ${escapeHtml(f.folio)}</span>
          <span>Click to zoom</span>
        </figcaption>
      </figure>
    `
    : '';

  viewer.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:0.5rem;">
      <h3 style="margin:0;font-size:1.35rem;">Folio <code>${escapeHtml(f.folio)}</code> · ${escapeHtml(f.title)}</h3>
      <span class="pill-badge">${escapeHtml(f.section)} · Yale Scan Page ${f.pdf_page}</span>
    </div>
    <p style="color:var(--text-muted);margin:0.45rem 0 0;">${escapeHtml(f.summary)}</p>

    <div class="viewer-two-col">
      <div>
        <figure class="scan-figure">
          <img src="${escapeHtml(f.image)}" alt="High-resolution scan of ${escapeHtml(f.folio)}" width="640" height="850" decoding="async" data-zoom="${escapeHtml(f.image)}" />
          <figcaption class="scan-caption">
            <span>Primary scan · ${escapeHtml(f.folio)}</span>
            <span>Click to zoom</span>
          </figcaption>
        </figure>
        ${secondScanHtml}
      </div>
      <div>
        <h4 style="margin-top:0;margin-bottom:0.65rem;">Line-by-Line Interactive Clause Breakdown</h4>
        ${clausesHtml}
      </div>
    </div>
  `;
}

function renderSpecimens(): void {
  if (!explorerData) return;
  const grid = document.getElementById('specimensGrid');
  if (!grid || grid.childElementCount > 0) return;

  grid.innerHTML = explorerData.specimens
    .map((s) => {
      const rootChips = s.voynich_stems.dominant_roots
        .map((r) => {
          const clean = r.split(' ')[0].replace(/[^a-zA-Z]/g, '');
          return `<button type="button" class="word-chip" data-word="${escapeHtml(clean)}">${escapeHtml(r)}</button>`;
        })
        .join('');
      return `
        <article class="specimen-card">
          <div class="specimen-img-wrap">
            <img src="${escapeHtml(s.imageUrl)}" alt="Folio ${escapeHtml(s.folio)} ${escapeHtml(s.common_name)}" width="480" height="360" decoding="async" data-zoom="${escapeHtml(s.imageUrl)}" />
          </div>
          <div class="specimen-body">
            <span class="pill-badge">${escapeHtml(s.id)} · Folio ${escapeHtml(s.folio)} (p.${s.pdf_page})</span>
            <h3 style="margin:0.1rem 0 0.35rem;font-size:1.12rem;">${escapeHtml(s.common_name)}</h3>
            <p style="margin:0 0 0.55rem;font-size:0.84rem;color:var(--text-muted);">
              <strong>15th-c. Identification:</strong> <em>${escapeHtml(s.latin_candidates.join(' / '))}</em>
            </p>
            <p style="font-size:0.89rem;margin:0 0 0.9rem;color:var(--text-primary);">${escapeHtml(s.plain_english_dossier)}</p>
            <div style="margin-top:auto;">
              <div style="font-size:0.76rem;font-weight:700;color:var(--text-muted);margin-bottom:0.35rem;">Key Voynich Stems (Click to Decode):</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${rootChips}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderLexiconAndParadigms(): void {
  if (!explorerData) return;
  const lexBody = document.querySelector('#lexiconTable tbody');
  if (lexBody) {
    lexBody.innerHTML = explorerData.lexicon
      .map((row) => {
        const chips = row.examples
          .split(',')
          .map((ex) => {
            const w = ex.trim();
            return `<button type="button" class="word-chip" data-word="${escapeHtml(w)}">${escapeHtml(w)}</button>`;
          })
          .join(' ');
        return `
          <tr>
            <td><code>${escapeHtml(row.stem)}</code></td>
            <td>${escapeHtml(row.category)}</td>
            <td><strong>${escapeHtml(row.meaning)}</strong></td>
            <td><div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${chips}</div></td>
            <td>${escapeHtml(row.grounding)}</td>
          </tr>
        `;
      })
      .join('');
  }

  const parBody = document.querySelector('#paradigmTable tbody');
  if (parBody) {
    parBody.innerHTML = explorerData.paradigms
      .map((p) => {
        const c = p.cases || {};
        const fmt = (cell?: ParadigmCell) =>
          cell && cell.top_form
            ? `<button type="button" class="word-chip" data-word="${escapeHtml(cell.top_form)}">${escapeHtml(cell.top_form)}</button> <small style="color:var(--text-muted)">(${cell.count})</small>`
            : `<span style="color:var(--text-muted)">-</span>`;
        return `
          <tr>
            <td><strong><code>${escapeHtml(p.root)}</code></strong></td>
            <td>${escapeHtml(p.semantic_class || p.gloss || '')}</td>
            <td>${p.total_tokens ?? ''}</td>
            <td>${fmt(c.NOM)}</td>
            <td>${fmt(c.GEN_PART)}</td>
            <td>${fmt(c.LOC)}</td>
            <td>${fmt(c.INST)}</td>
            <td>${fmt(c.PROC)}</td>
            <td>${fmt(c.TERM)}</td>
          </tr>
        `;
      })
      .join('');
  }
}

function renderZodiacAndBalneo(): void {
  if (!explorerData) return;
  const zBody = document.querySelector('#zodiacTable tbody');
  if (zBody) {
    zBody.innerHTML = explorerData.zodiac
      .map((m) => {
        const chips = m.top_nymph_labels
          .slice(0, 5)
          .map(
            (w) =>
              `<button type="button" class="word-chip" data-word="${escapeHtml(w)}">${escapeHtml(w)}</button>`,
          )
          .join(' ');
        return `
          <tr>
            <td><button type="button" class="folio-jump-btn" data-jump-folio="${escapeHtml(m.folio)}">${escapeHtml(m.folio)}</button></td>
            <td><strong>${escapeHtml(m.sign)}</strong></td>
            <td><span class="pill-badge" style="margin:0;">${escapeHtml(m.european_month_gloss)}</span></td>
            <td>${escapeHtml(m.triplicity)} (${escapeHtml(m.season)})</td>
            <td>${m.ring_token_count}</td>
            <td>${m.nymph_label_count}</td>
            <td><strong>${(m.o_prefix_rate * 100).toFixed(1)}%</strong></td>
            <td><div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${chips}</div></td>
          </tr>
        `;
      })
      .join('');
  }

  const bBody = document.querySelector('#balneoTable tbody');
  if (bBody) {
    bBody.innerHTML = explorerData.balneo
      .map((f) => {
        const allLabs = [...(f.nymph_labels || []), ...(f.tube_labels || [])].slice(0, 6);
        const labChips = allLabs.length
          ? allLabs
              .map(
                (w) =>
                  `<button type="button" class="word-chip" data-word="${escapeHtml(w)}">${escapeHtml(w)}</button>`,
              )
              .join(' ')
          : `<span style="color:var(--text-muted)">Pure-text / unlabelled pool</span>`;
        const proseChips = (f.top_prose_words || [])
          .slice(0, 4)
          .map(
            (w) =>
              `<button type="button" class="word-chip" data-word="${escapeHtml(w)}">${escapeHtml(w)}</button>`,
          )
          .join(' ');
        return `
          <tr>
            <td><button type="button" class="folio-jump-btn" data-jump-folio="${escapeHtml(f.folio)}">${escapeHtml(f.folio)}</button></td>
            <td>${f.prose_tokens}</td>
            <td>${(f.thermal_boil_rate * 100).toFixed(1)}%</td>
            <td>${(f.wash_bathe_rate * 100).toFixed(1)}%</td>
            <td>${(f.pool_vessel_rate * 100).toFixed(1)}%</td>
            <td><div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${labChips}</div></td>
            <td><div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${proseChips}</div></td>
          </tr>
        `;
      })
      .join('');
  }
}

async function ensureCorpusLoaded(): Promise<void> {
  if (corpusFolios) return;
  const res = await fetch('/content/folios-corpus.json');
  const data = (await res.json()) as { folios: readonly CorpusFolio[] };
  corpusFolios = data.folios;
  renderCorpusFolioList();
  renderCorpusFolioDetail(activeCorpusFolioId);
}

function renderCorpusFolioList(): void {
  if (!corpusFolios) return;
  const listEl = document.getElementById('corpusFolioList');
  const searchEl = document.getElementById('corpusSearchInput') as HTMLInputElement | null;
  const secEl = document.getElementById('corpusSectionFilter') as HTMLSelectElement | null;
  const langEl = document.getElementById('corpusLangFilter') as HTMLSelectElement | null;
  if (!listEl) return;

  const q = (searchEl?.value || '').trim().toLowerCase();
  const sec = secEl?.value || '';
  const lang = langEl?.value || '';

  const filtered = corpusFolios.filter((f) => {
    if (sec && !f.section.toLowerCase().includes(sec.toLowerCase())) return false;
    if (lang && f.lang !== lang) return false;
    if (!q) return true;
    if (f.folio.toLowerCase().includes(q) || f.section.toLowerCase().includes(q)) return true;
    return f.lines.some((l) => l.eva.toLowerCase().includes(q));
  });

  listEl.innerHTML =
    filtered
      .map(
        (f) => `
      <button type="button" class="nav-item-btn ${f.folio === activeCorpusFolioId ? 'active' : ''}" data-corpus-folio="${escapeHtml(f.folio)}">
        <strong>${escapeHtml(f.folio)} · ${escapeHtml(f.section)}</strong>
        <span>Quire ${escapeHtml(f.quire || '-')} · Lang ${escapeHtml(f.lang || '-')} · Hand ${escapeHtml(f.hand || '-')} · ${f.wordCount} words${f.scans.length ? ` · ${f.scans.length} scan(s)` : ''}</span>
      </button>
    `,
      )
      .join('') || `<p style="padding:0.5rem;color:var(--text-muted);">No matching folios.</p>`;
}

function renderCorpusFolioDetail(folioId: string): void {
  if (!corpusFolios) return;
  const f = corpusFolios.find((item) => item.folio === folioId) || corpusFolios[0];
  if (!f) return;
  activeCorpusFolioId = f.folio;

  document.querySelectorAll<HTMLButtonElement>('#corpusFolioList .nav-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.corpusFolio === f.folio);
  });

  const viewer = document.getElementById('corpusFolioViewer');
  if (!viewer) return;

  const scansHtml = f.scans.length
    ? f.scans
        .map(
          (scanFile) => `
        <figure class="scan-figure">
          <img src="/pages/${escapeHtml(scanFile)}" alt="Scan ${escapeHtml(scanFile)}" width="640" height="850" loading="lazy" data-zoom="/pages/${escapeHtml(scanFile)}" />
          <figcaption class="scan-caption">
            <span><code>${escapeHtml(scanFile)}</code></span>
            <span>Click to zoom</span>
          </figcaption>
        </figure>
      `,
        )
        .join('')
    : `<div class="clause-box" style="color:var(--text-muted);">No standalone PNG crop extracted for <code>${escapeHtml(f.folio)}</code> yet; see Yale Beinecke PDF Page <strong>${f.pdfPage ?? '-'}</strong> (Beinecke ID <code>${escapeHtml(f.beineckeId || '-')}</code>) in the Research Library tab.</div>`;

  const labelsHtml = f.labels.length
    ? `
      <div class="clause-box">
        <div class="clause-locus">Figure &amp; Diagram Labels (${f.labels.length}) · Click any label to decode:</div>
        <div class="clause-tokens">
          ${f.labels
            .map(
              (l) =>
                `<button type="button" class="word-chip" data-word="${escapeHtml(l.word.replace(/[^a-zA-Z0-9]/g, ''))}" title="${escapeHtml(l.locus)}">${escapeHtml(l.word)}</button>`,
            )
            .join('')}
        </div>
      </div>
    `
    : '';

  const linesHtml = f.lines
    .map((line) => {
      const tokens = line.eva
        .split(/\s+/)
        .filter(Boolean)
        .map((tok) => {
          const clean = tok.replace(/[^a-zA-Z0-9]/g, '');
          return `<button type="button" class="word-chip" data-word="${escapeHtml(clean)}">${escapeHtml(tok)}</button>`;
        })
        .join('');
      return `
        <div class="clause-box">
          <div class="clause-locus">${escapeHtml(line.locus)} ${line.tag ? `<code>${escapeHtml(line.tag)}</code>` : ''}</div>
          <div class="clause-tokens" style="margin-bottom:0;">${tokens}</div>
        </div>
      `;
    })
    .join('');

  viewer.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:0.5rem;margin-bottom:0.75rem;">
      <h3 style="margin:0;font-size:1.35rem;">Folio <code>${escapeHtml(f.folio)}</code> · ${escapeHtml(f.section)}</h3>
      <span class="pill-badge">
        Quire ${escapeHtml(f.quire || '-')} · Currier Lang ${escapeHtml(f.lang || '-')} · Scribe Hand ${escapeHtml(f.hand || '-')} · Yale PDF p.${f.pdfPage ?? '-'}
      </span>
    </div>

    <div class="stats-strip" style="margin-top:0;margin-bottom:1rem;">
      <div class="stat-card">
        <div class="stat-value">${f.wordCount}</div>
        <div class="stat-label">Transcribed Words</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${f.lineCount}</div>
        <div class="stat-label">Text Loci / Lines</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${f.labels.length}</div>
        <div class="stat-label">Figure Labels</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${f.intrusionCount}</div>
        <div class="stat-label">Drawing Intrusions (&lt;-&gt;)</div>
      </div>
    </div>

    <div class="viewer-two-col">
      <div>
        <h4 style="margin-top:0;margin-bottom:0.6rem;">Extracted Folio Scans (${f.scans.length})</h4>
        ${scansHtml}
      </div>
      <div>
        <h4 style="margin-top:0;margin-bottom:0.6rem;">Complete EVA Transliteration (Click Any Word to Decode)</h4>
        ${labelsHtml}
        ${linesHtml || '<p style="color:var(--text-muted);">No prose lines recorded on this locus.</p>'}
      </div>
    </div>
  `;
}

async function loadDocMarkdown(slug: string): Promise<string> {
  const cached = docCache.get(slug);
  if (cached) return cached;
  const res = await fetch(`/content/docs/${encodeURIComponent(slug)}.json`);
  if (!res.ok) return '# Document not found';
  const data = (await res.json()) as { markdown: string };
  docCache.set(slug, data.markdown);
  return data.markdown;
}

async function loadAndRenderDoc(slug: string): Promise<void> {
  if (!catalogData) return;
  const docMeta =
    catalogData.docs.find((d) => d.slug === slug) ||
    catalogData.docs.find((d) => d.slug === 'plain-english-visual-readers-guide') ||
    catalogData.docs[0];
  if (!docMeta) return;
  activeDocSlug = docMeta.slug;

  document.querySelectorAll<HTMLButtonElement>('#docsSidebarList .nav-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.docSlug === activeDocSlug);
  });

  const headerEl = document.getElementById('docViewerHeader');
  const bodyEl = document.getElementById('docViewerBody');
  if (!headerEl || !bodyEl) return;

  const ghUrl = `${versionMeta.repoUrl}/blob/${versionMeta.commitSha}/${docMeta.sourcePath}`;
  headerEl.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;">
      <div>
        <span class="pill-badge">${escapeHtml(docMeta.category)}</span>
        <div style="font-size:0.82rem;color:var(--text-muted);">
          Source file: <code>${escapeHtml(docMeta.sourcePath)}</code> (${docMeta.sizeKB} KB)
        </div>
      </div>
      <a href="${escapeHtml(ghUrl)}" target="_blank" rel="noopener noreferrer" class="parent-link">
        View on GitHub (@${escapeHtml(versionMeta.shortSha)}) ↗
      </a>
    </div>
  `;

  bodyEl.innerHTML = '<p>Loading document…</p>';
  const md = await loadDocMarkdown(docMeta.slug);
  bodyEl.innerHTML = renderMarkdownToHtml(md);
}

function renderLibraryCatalog(): void {
  if (!catalogData) return;

  // 1. Docs sidebar list grouped by category
  const docsListEl = document.getElementById('docsSidebarList');
  const docSearchEl = document.getElementById('docSearchInput') as HTMLInputElement | null;
  if (docsListEl) {
    const q = (docSearchEl?.value || '').trim().toLowerCase();
    const filteredDocs = catalogData.docs.filter(
      (d) =>
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.sourcePath.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q),
    );

    const byCat = new Map<string, DocMeta[]>();
    for (const d of filteredDocs) {
      const list = byCat.get(d.category) ?? [];
      list.push(d);
      byCat.set(d.category, list);
    }

    const groupsHtml: string[] = [];
    for (const [cat, items] of [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      groupsHtml.push(`<div class="category-heading">${escapeHtml(cat)}</div>`);
      for (const item of items) {
        groupsHtml.push(`
          <button type="button" class="nav-item-btn ${item.slug === activeDocSlug ? 'active' : ''}" data-doc-slug="${escapeHtml(item.slug)}">
            <strong>${escapeHtml(item.title)}</strong>
            <span><code>${escapeHtml(item.sourcePath)}</code> · ${item.sizeKB} KB</span>
          </button>
        `);
      }
    }
    docsListEl.innerHTML = groupsHtml.join('');
  }

  // 2. Books grid
  const booksGrid = document.getElementById('booksGrid');
  if (booksGrid) {
    booksGrid.innerHTML = versionMeta.books
      .map(
        (b) => `
        <article class="specimen-card">
          <div class="specimen-body">
            <span class="pill-badge">${b.pages} Pages · ${escapeHtml(b.resolution)} · ${b.sizeMB} MB PDF</span>
            <h4 style="margin:0.15rem 0 0.4rem;font-size:1.1rem;">${escapeHtml(b.name)}</h4>
            <p style="font-size:0.88rem;color:var(--text-muted);margin:0 0 1rem;">${escapeHtml(b.description)}</p>
            <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:0.5rem;">
              <a href="${escapeHtml(b.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="parent-link">
                Download Full PDF (${b.sizeMB} MB) ↗
              </a>
              <a href="${escapeHtml(b.githubBlobUrl)}" target="_blank" rel="noopener noreferrer" class="parent-link">
                GitHub LFS Page ↗
              </a>
            </div>
          </div>
        </article>
      `,
      )
      .join('');
  }

  // 3. Data files list
  renderDataFilesList();
}

function renderDataFilesList(): void {
  if (!catalogData) return;
  const listEl = document.getElementById('dataFilesList');
  const searchEl = document.getElementById('dataSearchInput') as HTMLInputElement | null;
  if (!listEl) return;
  const q = (searchEl?.value || '').trim().toLowerCase();

  const filtered = catalogData.dataFiles.filter(
    (df) => !q || df.file.toLowerCase().includes(q) || df.label.toLowerCase().includes(q),
  );

  listEl.innerHTML = filtered
    .map(
      (df) => `
      <button type="button" class="nav-item-btn" data-datafile="${escapeHtml(df.file)}">
        <strong>${escapeHtml(df.label)}</strong>
        <span><code>data/${escapeHtml(df.file)}</code> · ${df.sizeKB} KB</span>
      </button>
    `,
    )
    .join('');
}

async function inspectDataFile(filename: string): Promise<void> {
  const viewer = document.getElementById('dataFileViewer');
  if (!viewer) return;

  document.querySelectorAll<HTMLButtonElement>('#dataFilesList .nav-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.datafile === filename);
  });

  const ghUrl = `${versionMeta.repoUrl}/blob/${versionMeta.commitSha}/data/${encodeURIComponent(filename)}`;
  viewer.innerHTML = `<p>Loading <code>data/${escapeHtml(filename)}</code>…</p>`;

  try {
    const res = await fetch(`/data/${encodeURIComponent(filename)}`);
    const text = await res.text();
    const preview = text.length > 28000 ? text.slice(0, 28000) + '\n\n... [Truncated in preview · open raw file for full output]' : text;

    viewer.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:0.85rem;">
        <div>
          <span class="pill-badge">Machine-Readable Dataset</span>
          <h3 style="margin:0.15rem 0 0;"><code>data/${escapeHtml(filename)}</code></h3>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <a href="/data/${escapeHtml(filename)}" target="_blank" rel="noopener noreferrer" class="parent-link">Open Raw File ↗</a>
          <a href="${escapeHtml(ghUrl)}" target="_blank" rel="noopener noreferrer" class="parent-link">GitHub (@${escapeHtml(versionMeta.shortSha)}) ↗</a>
        </div>
      </div>
      <pre style="max-height:68vh;overflow:auto;padding:1rem;border-radius:0.75rem;background:var(--surface-subtle);border:1px solid var(--border-subtle);font-size:0.8rem;"><code>${escapeHtml(preview)}</code></pre>
    `;
  } catch {
    viewer.innerHTML = `<p>Could not load <code>data/${escapeHtml(filename)}</code>.</p>`;
  }
}

function renderScansGallery(): void {
  if (!catalogData) return;
  const grid = document.getElementById('scansGalleryGrid');
  const searchEl = document.getElementById('scanGallerySearch') as HTMLInputElement | null;
  if (!grid) return;

  const q = (searchEl?.value || '').trim().toLowerCase();
  const filtered = catalogData.pages.filter(
    (p) => !q || p.file.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q),
  );

  grid.innerHTML = filtered
    .slice(0, 60)
    .map(
      (p) => `
      <article class="specimen-card">
        <div class="specimen-img-wrap">
          <img src="${escapeHtml(p.url)}" alt="Scan ${escapeHtml(p.file)}" width="480" height="360" decoding="async" data-zoom="${escapeHtml(p.url)}" />
        </div>
        <div class="specimen-body" style="padding:0.85rem 1rem;">
          <span class="pill-badge">Folio ${escapeHtml(p.folio)} · ${p.sizeKB} KB</span>
          <div style="font-family:var(--font-mono);font-size:0.8rem;word-break:break-all;">${escapeHtml(p.file)}</div>
        </div>
      </article>
    `,
    )
    .join('');
}

function openLightbox(imgUrl: string): void {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg') as HTMLImageElement | null;
  const caption = document.getElementById('lightboxCaption');
  const link = document.getElementById('lightboxNewTab') as HTMLAnchorElement | null;
  if (!modal || !img) return;

  img.src = imgUrl;
  if (caption) caption.textContent = imgUrl.split('/').pop() || imgUrl;
  if (link) link.href = imgUrl;
  modal.hidden = false;
}

function closeLightbox(): void {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.hidden = true;
}

async function bootstrap(): Promise<void> {
  renderShell();
  updateDecoderUI('qokeedy');

  // Wire event listeners via delegation
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('wordInput')?.addEventListener('input', (e) => {
    updateDecoderUI((e.target as HTMLInputElement).value);
  });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxModal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'lightboxModal') closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const tabBtn = target.closest<HTMLButtonElement>('[data-tab]');
    if (tabBtn?.dataset.tab) {
      switchTab(tabBtn.dataset.tab);
      return;
    }

    const jumpTabBtn = target.closest<HTMLButtonElement>('[data-jump-tab]');
    if (jumpTabBtn?.dataset.jumpTab) {
      switchTab(jumpTabBtn.dataset.jumpTab);
      if (jumpTabBtn.dataset.jumpSubtab) {
        const subBtn = document.querySelector<HTMLButtonElement>(
          `[data-subtab="${jumpTabBtn.dataset.jumpSubtab}"]`,
        );
        subBtn?.click();
      }
      return;
    }

    const subtabBtn = target.closest<HTMLButtonElement>('[data-subtab]');
    if (subtabBtn?.dataset.subtab) {
      const sub = subtabBtn.dataset.subtab;
      document.querySelectorAll<HTMLButtonElement>('[data-subtab]').forEach((b) => {
        b.setAttribute('aria-selected', b.dataset.subtab === sub ? 'true' : 'false');
      });
      const docsP = document.getElementById('subpanel-docs');
      const dataP = document.getElementById('subpanel-datasets');
      const scansP = document.getElementById('subpanel-scans');
      if (docsP) docsP.style.display = sub === 'docs' ? 'grid' : 'none';
      if (dataP) dataP.style.display = sub === 'datasets' ? 'block' : 'none';
      if (scansP) {
        scansP.style.display = sub === 'scans' ? 'block' : 'none';
        if (sub === 'scans') renderScansGallery();
      }
      return;
    }

    const wordBtn = target.closest<HTMLElement>('[data-word]');
    if (wordBtn?.dataset.word) {
      updateDecoderUI(wordBtn.dataset.word);
      document.querySelector('.decoder-dock')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    const jumpFolioBtn = target.closest<HTMLElement>('[data-jump-folio]');
    if (jumpFolioBtn?.dataset.jumpFolio) {
      const folioId = jumpFolioBtn.dataset.jumpFolio;
      activeCorpusFolioId = folioId;
      switchTab('corpus');
      void ensureCorpusLoaded().then(() => renderCorpusFolioDetail(folioId));
      return;
    }

    const walkthroughBtn = target.closest<HTMLButtonElement>('[data-walkthrough-idx]');
    if (walkthroughBtn?.dataset.walkthroughIdx !== undefined) {
      renderWalkthroughDetail(Number(walkthroughBtn.dataset.walkthroughIdx));
      return;
    }

    const corpusBtn = target.closest<HTMLButtonElement>('[data-corpus-folio]');
    if (corpusBtn?.dataset.corpusFolio) {
      renderCorpusFolioDetail(corpusBtn.dataset.corpusFolio);
      return;
    }

    const docBtn = target.closest<HTMLElement>('[data-doc-slug]');
    if (docBtn?.dataset.docSlug) {
      e.preventDefault();
      const slug = docBtn.dataset.docSlug;
      switchTab('library');
      void loadAndRenderDoc(slug);
      return;
    }

    const dataBtn = target.closest<HTMLButtonElement>('[data-datafile]');
    if (dataBtn?.dataset.datafile) {
      void inspectDataFile(dataBtn.dataset.datafile);
      return;
    }

    const zoomEl = target.closest<HTMLElement>('[data-zoom]');
    if (zoomEl?.dataset.zoom) {
      e.preventDefault();
      openLightbox(zoomEl.dataset.zoom);
    }
  });

  // Load main explorer & catalog bundles in parallel
  const [expRes, catRes, guideMd] = await Promise.all([
    fetch('/content/explorer-data.json').then((r) => r.json() as Promise<ExplorerData>),
    fetch('/content/catalog.json').then((r) => r.json() as Promise<CatalogData>),
    loadDocMarkdown('plain-english-visual-readers-guide'),
  ]);

  explorerData = expRes;
  catalogData = catRes;

  updateDecoderUI('qokeedy');
  const overviewGuideEl = document.getElementById('overviewGuideBody');
  if (overviewGuideEl) {
    overviewGuideEl.innerHTML = renderMarkdownToHtml(guideMd);
  }

  renderLexiconAndParadigms();
  renderZodiacAndBalneo();
  renderLibraryCatalog();

  // Filter inputs
  document.getElementById('corpusSearchInput')?.addEventListener('input', renderCorpusFolioList);
  document.getElementById('corpusSectionFilter')?.addEventListener('change', renderCorpusFolioList);
  document.getElementById('corpusLangFilter')?.addEventListener('change', renderCorpusFolioList);
  document.getElementById('docSearchInput')?.addEventListener('input', renderLibraryCatalog);
  document.getElementById('dataSearchInput')?.addEventListener('input', renderDataFilesList);
  document.getElementById('scanGallerySearch')?.addEventListener('input', renderScansGallery);
}

void bootstrap();
