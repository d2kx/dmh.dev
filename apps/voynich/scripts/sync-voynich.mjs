#!/usr/bin/env node
/**
 * scripts/sync-voynich.mjs
 *
 * Synchronizes structured data, 227-folio EVA corpus, 41 research markdown guides,
 * and catalog metadata from the local `voynich-research` repository into
 * `apps/voynich/public/content/` and records the exact pinned Git commit/date
 * in `apps/voynich/src/voynich-version.json`.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const VOYNICH_REPO = process.env.VOYNICH_REPO_PATH
  ? path.resolve(process.env.VOYNICH_REPO_PATH)
  : path.resolve(APP_ROOT, '..', '..', '..', 'voynich');

if (!fs.existsSync(VOYNICH_REPO)) {
  console.error(`Could not find voynich-research repository at: ${VOYNICH_REPO}`);
  process.exit(1);
}

const CONTENT_DIR = path.join(APP_ROOT, 'public', 'content');
const DOCS_DIR = path.join(CONTENT_DIR, 'docs');
fs.mkdirSync(DOCS_DIR, { recursive: true });

// 1. Read exact Git commit metadata from voynich-research
const gitRaw = execSync('git log -n 1 --format="%H|%h|%ci|%s"', {
  cwd: VOYNICH_REPO,
  encoding: 'utf-8',
}).trim();
const [commitSha, shortSha, commitIso, commitSubject] = gitRaw.split('|');
const commitDate = commitIso.slice(0, 10);

console.log(`Syncing from voynich-research @ ${shortSha} (${commitDate}): ${commitSubject}`);

// Helper to replace em dashes with middle dots or hyphens per dmh.dev style rule
function cleanDashes(str) {
  return String(str).replace(/\s*—\s*/g, ' · ');
}

// 2. Extract embedded DATA JSON from explorer/index.html
const explorerHtml = fs.readFileSync(path.join(VOYNICH_REPO, 'explorer', 'index.html'), 'utf-8');
const dataMatch = explorerHtml.match(/const DATA = (\{[\s\S]*?\});\s*\n\s*const PREFIX_RULES/);
if (!dataMatch) {
  throw new Error('Could not extract const DATA from explorer/index.html');
}
const explorerData = JSON.parse(cleanDashes(dataMatch[1]));

// Normalize image paths in explorerData.folios and explorerData.specimens to `/pages/...`
for (const f of explorerData.folios) {
  if (f.image) f.image = '/pages/' + path.basename(f.image);
  if (f.secondary_image) f.secondary_image = '/pages/' + path.basename(f.secondary_image);
}
for (const s of explorerData.specimens) {
  const img = s.image_rel_notes || s.image || '';
  s.imageUrl = img ? '/pages/' + path.basename(img) : '';
}

// 3. Scan all git-tracked images in pages/
const pagesDir = path.join(VOYNICH_REPO, 'pages');
const trackedPages = new Set(
  execSync(`git -C "${VOYNICH_REPO}" ls-files pages/`, { encoding: 'utf-8' })
    .split(/\r?\n/)
    .map((p) => path.basename(p.trim()))
    .filter(Boolean),
);
const pageFiles = fs
  .readdirSync(pagesDir)
  .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && trackedPages.has(f))
  .sort();

const pagesCatalog = pageFiles.map((file) => {
  const stat = fs.statSync(path.join(pagesDir, file));
  const folioMatch = file.match(/^(f\d+[rv]\d*)/i);
  return {
    file,
    url: `/pages/${file}`,
    folio: folioMatch ? folioMatch[1].toLowerCase() : 'general',
    sizeKB: Math.round((stat.size / 1024) * 10) / 10,
    isEnhanced: file.includes('_enh'),
  };
});

// Group page scans by folio id
const scansByFolio = new Map();
for (const item of pagesCatalog) {
  const list = scansByFolio.get(item.folio) ?? [];
  list.push(item.file);
  scansByFolio.set(item.folio, list);
}

// 4. Parse ZL3b-n.txt to extract clean EVA lines per folio & global word frequencies
const zlPath = path.join(VOYNICH_REPO, 'data', 'ZL3b-n.txt');
const zlContent = fs.readFileSync(zlPath, 'utf-8');
const linesByFolio = new Map();
const wordCounts = new Map();
const wordFolios = new Map();

for (const rawLine of zlContent.split(/\r?\n/)) {
  if (!rawLine || rawLine.startsWith('#')) continue;
  // Format: <f1r.1,@P0>       fachys.ykal.ar.ataiin...
  const m = rawLine.match(/^<((f\d+[rv]\d*)\.([^,>]+))(?:,([^>]+))?>\s+(.*)$/);
  if (!m) continue;
  const fullLocus = m[1];
  const folio = m[2];
  const tag = m[4] || '';
  let text = m[5]
    .replace(/<[^>]*>/g, '') // strip inline tags like <->, <$>, <%>
    .replace(/\{[^}]*\}/g, '') // strip inline comments
    .replace(/\[([^\]:]+):[^\]]+\]/g, '$1') // keep primary reading in [a:b]
    .replace(/[!*?%]/g, '')
    .replace(/[.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) continue;
  const arr = linesByFolio.get(folio) ?? [];
  arr.push({
    locus: fullLocus,
    tag,
    eva: text,
  });
  linesByFolio.set(folio, arr);

  for (const tok of text.split(' ')) {
    const clean = tok.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) continue;
    wordCounts.set(clean, (wordCounts.get(clean) ?? 0) + 1);
    let fset = wordFolios.get(clean);
    if (!fset) {
      fset = new Set();
      wordFolios.set(clean, fset);
    }
    if (fset.size < 8) fset.add(folio);
  }
}

// Build compact word concordance for top 1,500 words
const sortedWords = [...wordCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 1500);
const wordConcordance = {};
for (const [w, count] of sortedWords) {
  wordConcordance[w] = {
    c: count,
    f: [...(wordFolios.get(w) ?? [])],
  };
}

// 5. Build 227-folio corpus from data/folio_index.json + parsed ZL3b-n lines + matched scans
const folioIndexRaw = JSON.parse(
  fs.readFileSync(path.join(VOYNICH_REPO, 'data', 'folio_index.json'), 'utf-8'),
);

const foliosList = Object.values(folioIndexRaw.folios).map((f) => {
  const pdfInfo = f.pdf_pages && f.pdf_pages[0] ? f.pdf_pages[0] : {};
  const directScans = scansByFolio.get(f.folio) ?? [];
  // Also match prefix scans like f102v2 -> f102v
  return {
    folio: f.folio,
    quire: f.quire || '',
    sectionCode: f.section_code || '',
    section: f.section || 'Unknown',
    lang: f.currier_lang || '',
    hand: f.hand || '',
    lineCount: f.lines || 0,
    wordCount: f.words || 0,
    intrusionCount: f.drawing_intrusions || 0,
    pdfPage: pdfInfo.pdf1_page || null,
    beineckeId: pdfInfo.beinecke_image_id || '',
    comments: f.comments || [],
    labels: (f.labels || []).slice(0, 40),
    titles: f.right_justified_titles || [],
    scans: directScans,
    lines: (linesByFolio.get(f.folio) ?? []).slice(0, 80),
  };
});

// 6. Catalog all git-tracked files in data/
const dataDir = path.join(VOYNICH_REPO, 'data');
const trackedData = new Set(
  execSync(`git -C "${VOYNICH_REPO}" ls-files data/`, { encoding: 'utf-8' })
    .split(/\r?\n/)
    .map((p) => path.basename(p.trim()))
    .filter(Boolean),
);
const dataFiles = fs
  .readdirSync(dataDir)
  .filter((f) => /\.(json|txt)$/i.test(f) && trackedData.has(f))
  .sort()
  .map((file) => {
    const stat = fs.statSync(path.join(dataDir, file));
    const attackMatch = file.match(/^attack(\d+)_(.+)\.json$/i);
    const label = attackMatch
      ? `Attack #${attackMatch[1]}: ${attackMatch[2].replace(/_/g, ' ')}`
      : file.replace(/\.(json|txt)$/i, '').replace(/_/g, ' ');
    return {
      file,
      url: `/data/${file}`,
      attackNum: attackMatch ? Number(attackMatch[1]) : null,
      label,
      ext: path.extname(file).slice(1).toLowerCase(),
      sizeKB: Math.round((stat.size / 1024) * 10) / 10,
    };
  })
  .sort((a, b) => {
    if (a.attackNum !== null && b.attackNum !== null) return b.attackNum - a.attackNum;
    if (a.attackNum !== null) return -1;
    if (b.attackNum !== null) return 1;
    return a.file.localeCompare(b.file);
  });

// 7. Catalog and bundle all Markdown guides (README.md, NOTES.md, and notes/*.md)
function categorizeDoc(slug, filename) {
  if (
    slug === 'plain-english-visual-readers-guide' ||
    slug === 'visual-botanical-and-astro-identifications' ||
    slug === 'readme'
  ) {
    return '1. Start Here: Plain-English & Visual Guides';
  }
  if (
    filename.includes('ATLAS') ||
    filename.includes('ZODIAC') ||
    filename.includes('BALNEO') ||
    filename.includes('ROSETTES') ||
    filename.includes('SPECIMEN') ||
    filename.includes('HANDBOOK')
  ) {
    return '2. Botanical, Astronomical & Bathing Atlases';
  }
  if (
    filename.includes('LEXICON') ||
    filename.includes('GRAMMAR') ||
    filename.includes('PARADIGM') ||
    filename.includes('CALCULUS') ||
    filename.includes('DICTIONARY') ||
    filename.includes('TREEBANK')
  ) {
    return '3. Grammar, Morphology & Root Lexicons';
  }
  if (
    filename.includes('READER') ||
    filename.includes('TRANSLATION') ||
    filename.includes('EDITION') ||
    filename.includes('GLOSSES') ||
    filename.includes('MONOGRAPH') ||
    filename.includes('INTERPRETER')
  ) {
    return '4. Full Translation & Interlinear Editions';
  }
  return '5. Master Research Log & Attack Syntheses';
}

function extractTitleAndSummary(md, fallbackTitle) {
  const lines = md.split(/\r?\n/);
  let title = fallbackTitle;
  let summary = '';
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && title === fallbackTitle) {
      title = h1[1].replace(/`/g, '').trim();
      continue;
    }
    const clean = line
      .replace(/^>\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .trim();
    if (
      clean &&
      !clean.startsWith('#') &&
      !clean.startsWith('|') &&
      !clean.startsWith('!') &&
      !clean.startsWith('---') &&
      clean.length > 35
    ) {
      summary = clean.slice(0, 220) + (clean.length > 220 ? '…' : '');
      break;
    }
  }
  return { title, summary };
}

const rawDocs = [
  {
    slug: 'plain-english-visual-readers-guide',
    sourcePath: 'notes/PLAIN_ENGLISH_VISUAL_READERS_GUIDE.md',
    pinnedOrder: 1,
  },
  {
    slug: 'visual-botanical-and-astro-identifications',
    sourcePath: 'notes/VISUAL_BOTANICAL_AND_ASTRO_IDENTIFICATIONS.md',
    pinnedOrder: 2,
  },
  {
    slug: 'zodiac-months-balneo-plumbing-and-botanical-atlas',
    sourcePath: 'notes/ZODIAC_MONTHS_BALNEO_PLUMBING_AND_BOTANICAL_ATLAS.md',
    pinnedOrder: 3,
  },
  {
    slug: 'eight-case-paradigm-and-paragraph-state-compiler',
    sourcePath: 'notes/EIGHT_CASE_PARADIGM_AND_PARAGRAPH_STATE_COMPILER.md',
    pinnedOrder: 4,
  },
  {
    slug: 'f76r-balneo-treatise-and-6index-compiler-compendium',
    sourcePath: 'notes/F76R_BALNEO_TREATISE_AND_6INDEX_COMPILER_COMPENDIUM.md',
    pinnedOrder: 5,
  },
  {
    slug: 'decoding-attacks-synthesis',
    sourcePath: 'notes/DECODING_ATTACKS_SYNTHESIS.md',
    pinnedOrder: 6,
  },
  {
    slug: 'notes-master-research-log',
    sourcePath: 'NOTES.md',
    pinnedOrder: 7,
  },
  {
    slug: 'readme',
    sourcePath: 'README.md',
    pinnedOrder: 8,
  },
];

const seenPaths = new Set(rawDocs.map((d) => d.sourcePath));
const notesFiles = fs
  .readdirSync(path.join(VOYNICH_REPO, 'notes'))
  .filter((f) => f.endsWith('.md'))
  .sort();

for (const nf of notesFiles) {
  const rel = `notes/${nf}`;
  if (seenPaths.has(rel)) continue;
  seenPaths.add(rel);
  rawDocs.push({
    slug: nf.replace(/\.md$/i, '').toLowerCase().replace(/_/g, '-'),
    sourcePath: rel,
    pinnedOrder: 99,
  });
}

const docsIndex = [];
for (const docEntry of rawDocs) {
  const fullPath = path.join(VOYNICH_REPO, docEntry.sourcePath);
  if (!fs.existsSync(fullPath)) continue;
  const markdown = cleanDashes(fs.readFileSync(fullPath, 'utf-8'));
  const stat = fs.statSync(fullPath);
  const { title, summary } = extractTitleAndSummary(markdown, docEntry.slug);
  const category = categorizeDoc(docEntry.slug, docEntry.sourcePath);

  const meta = {
    slug: docEntry.slug,
    sourcePath: docEntry.sourcePath,
    title,
    summary,
    category,
    pinnedOrder: docEntry.pinnedOrder,
    sizeKB: Math.round((stat.size / 1024) * 10) / 10,
  };
  docsIndex.push(meta);

  fs.writeFileSync(
    path.join(DOCS_DIR, `${docEntry.slug}.json`),
    JSON.stringify({ ...meta, markdown }),
    'utf-8',
  );
}

// 8. Write version metadata & bundled content files
const versionMeta = {
  repo: 'd2kx/voynich-research',
  repoUrl: 'https://github.com/d2kx/voynich-research',
  commitSha,
  shortSha,
  commitDate,
  commitIso,
  commitSubject,
  syncedAt: new Date().toISOString(),
  stats: {
    transcribedFolios: folioIndexRaw.summary.transcribed_folios,
    totalWords: folioIndexRaw.summary.total_words,
    totalLabels: folioIndexRaw.summary.total_labels,
    totalDrawingIntrusions: folioIndexRaw.summary.total_drawing_intrusions,
    walkthroughFolios: explorerData.folios.length,
    flagshipSpecimens: explorerData.specimens.length,
    highResScans: pagesCatalog.length,
    markdownGuides: docsIndex.length,
    dataFiles: dataFiles.length,
  },
  books: [
    {
      id: 'yale-2026',
      name: 'Yale Beinecke High-Resolution Export (214 pages)',
      file: 'books/voynich-yale-beinecke-2026-highres-214p.pdf',
      pages: 214,
      resolution: '~1500 × 2000 px',
      sizeMB: 138.4,
      description:
        'Primary visual forensics scan with 2x sharper pixel density, printed Beinecke Image IDs (1006076 to 1006283), and 4 physical fore-edge and spine scans (p210 to p213).',
      downloadUrl: `https://media.githubusercontent.com/media/d2kx/voynich-research/${commitSha}/books/voynich-yale-beinecke-2026-highres-214p.pdf`,
      githubBlobUrl: `https://github.com/d2kx/voynich-research/blob/${commitSha}/books/voynich-yale-beinecke-2026-highres-214p.pdf`,
    },
    {
      id: 'tcpdf-2014',
      name: 'Bookmarked TCPDF Edition (210 pages)',
      file: 'books/voynich-tcpdf-2014-bookmarked-210p.pdf',
      pages: 210,
      resolution: '~1082 × 1500 px',
      sizeMB: 75.2,
      description:
        'Fast navigation edition featuring a 210-entry clickable PDF bookmark sidebar (1r through 116v) that maps 1:1 to pages 1 to 209 of the Yale PDF.',
      downloadUrl: `https://media.githubusercontent.com/media/d2kx/voynich-research/${commitSha}/books/voynich-tcpdf-2014-bookmarked-210p.pdf`,
      githubBlobUrl: `https://github.com/d2kx/voynich-research/blob/${commitSha}/books/voynich-tcpdf-2014-bookmarked-210p.pdf`,
    },
  ],
};

fs.mkdirSync(path.join(APP_ROOT, 'src'), { recursive: true });
fs.writeFileSync(
  path.join(APP_ROOT, 'src', 'voynich-version.json'),
  JSON.stringify(versionMeta, null, 2),
  'utf-8',
);

fs.writeFileSync(
  path.join(CONTENT_DIR, 'explorer-data.json'),
  JSON.stringify({
    version: versionMeta,
    folios: explorerData.folios,
    specimens: explorerData.specimens,
    lexicon: explorerData.lexicon,
    paradigms: explorerData.paradigms,
    zodiac: explorerData.zodiac,
    balneo: explorerData.balneo,
    wordConcordance,
  }),
  'utf-8',
);

fs.writeFileSync(
  path.join(CONTENT_DIR, 'folios-corpus.json'),
  JSON.stringify({
    summary: folioIndexRaw.summary,
    folios: foliosList,
  }),
  'utf-8',
);

fs.writeFileSync(
  path.join(CONTENT_DIR, 'catalog.json'),
  JSON.stringify({
    docs: docsIndex,
    pages: pagesCatalog,
    dataFiles,
    books: versionMeta.books,
  }),
  'utf-8',
);

console.log(
  `Synced ${foliosList.length} folios, ${docsIndex.length} markdown guides, ${pagesCatalog.length} scan entries, and ${dataFiles.length} data files.`,
);
