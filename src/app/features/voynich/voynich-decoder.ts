import { Marked, Renderer, Tokens } from 'marked';

export interface ParsedVoynichWord {
  readonly word: string;
  readonly prefix: string;
  readonly prefixDesc: string;
  readonly stem: string;
  readonly stemDesc: string;
  readonly suffix: string;
  readonly suffixDesc: string;
  readonly gloss: string;
}

interface RuleEntry {
  readonly match: string;
  readonly label: string;
  readonly desc: string;
}

const PREFIX_RULES: readonly RuleEntry[] = [
  {
    match: 'pold',
    label: 'p- + old-',
    desc: "Paragraph Opener + Liquid Vessel ('Begin: in the liquid vessel')",
  },
  {
    match: 'qo',
    label: 'qo- (q + o-)',
    desc: "Active Procedural Step ('Then / And-it')",
  },
  {
    match: 'ol',
    label: 'ol-',
    desc: "Vessel / Pipe / Bath Locative ('In the pipe / vessel / bath')",
  },
  {
    match: 'ot',
    label: 'ot- (o + t-)',
    desc: "From/In the Source ('Of the root / celestial sector')",
  },
  {
    match: 'ok',
    label: 'ok- (o + k-)',
    desc: "Of the Core / Primary Essence ('The core...')",
  },
  {
    match: 'op',
    label: 'op- (o + p-)',
    desc: "Prepared / Compounded ('The prepared...')",
  },
  {
    match: 'od',
    label: 'od- (o + d-)',
    desc: "Measured / Drawn Portion ('From the...')",
  },
  {
    match: 'ch',
    label: 'ch-',
    desc: "Infuse / Steep ('Herbal infusion / decoction')",
  },
  {
    match: 'sh',
    label: 'sh-',
    desc: "Wash / Bathe ('Liquid surface wash / bath')",
  },
  {
    match: 'da',
    label: 'da- / d-',
    desc: "Take / From ('Take from the source')",
  },
  {
    match: 'sa',
    label: 'sa- / s-',
    desc: "Draw / Select ('Selected / drawn portion')",
  },
  {
    match: 'fa',
    label: 'f- (Gallows Opener)',
    desc: 'Paragraph / Section Declaration Opener',
  },
  {
    match: 'pc',
    label: 'p- (Gallows Opener)',
    desc: "Paragraph / Protocol Opener ('Begin...')",
  },
  {
    match: 'po',
    label: 'po- (Gallows Opener)',
    desc: "Paragraph Opener ('Begin from the vessel...')",
  },
  {
    match: 'fs',
    label: 'f- (Gallows Opener)',
    desc: "Paragraph Opener ('Begin by washing...')",
  },
  {
    match: 'yk',
    label: 'y- / yk-',
    desc: "Conjunction / Relative ('And the core...')",
  },
  {
    match: 'yd',
    label: 'yd-',
    desc: "Conjunction + Source ('And from the...')",
  },
  {
    match: 'o',
    label: 'o-',
    desc: "Nominal / Ingredient Article ('The [ingredient]')",
  },
  {
    match: 'l',
    label: 'l-',
    desc: "Liquid / Container Marker ('In the bath/vessel')",
  },
  {
    match: 'd',
    label: 'd-',
    desc: "Ablative / Imperative ('Take / From')",
  },
  {
    match: 's',
    label: 's-',
    desc: "Source / Demonstrative ('From this / Select')",
  },
  {
    match: 'y',
    label: 'y-',
    desc: "Clause Linker ('And / Then')",
  },
];

const SUFFIX_RULES: readonly RuleEntry[] = [
  {
    match: 'eedy',
    label: '-eedy',
    desc: "Intensive Active Process Verb ('boil / steep thoroughly')",
  },
  {
    match: 'edy',
    label: '-edy',
    desc: "Active Process Verb ('is boiled / washed / infused')",
  },
  {
    match: 'aiin',
    label: '-aiin',
    desc: "Measured Dose / Partitive ('one measured portion of')",
  },
  {
    match: 'ain',
    label: '-ain',
    desc: "Measured Dose ('one portion of')",
  },
  {
    match: 'iin',
    label: '-iin',
    desc: "Counted Minim Dose ('measured parts')",
  },
  {
    match: 'oldy',
    label: '-oldy',
    desc: "Steeped in Liquid/Pipe State ('infused in the liquid/conduit')",
  },
  {
    match: 'aldy',
    label: '-aldy',
    desc: "Prepared Essence State ('infused in essence')",
  },
  {
    match: 'ary',
    label: '-ary',
    desc: "Botanical / Root Part Label ('the [root] part')",
  },
  {
    match: 'ory',
    label: '-ory',
    desc: "Prepared / Extracted State ('drawn/washed')",
  },
  {
    match: 'ody',
    label: '-ody',
    desc: "Completed Action / State ('prepared / compounded')",
  },
  {
    match: 'am',
    label: '-am',
    desc: "Terminal Recipe Stop ('...to completion / seal at end')",
  },
  {
    match: 'om',
    label: '-om',
    desc: "Terminal Closure ('...complete the mixture')",
  },
  {
    match: 'ol',
    label: '-ol',
    desc: "Liquid Medium / Locative ('in the liquid extract / pipe')",
  },
  {
    match: 'or',
    label: '-or',
    desc: "Oil / Golden Essence ('in the oil / essence')",
  },
  {
    match: 'al',
    label: '-al',
    desc: "Instrumental Essence ('with the star/seed essence')",
  },
  {
    match: 'ar',
    label: '-ar',
    desc: "Botanical / Earth Base ('from the root/earth base')",
  },
  {
    match: 'dy',
    label: '-dy',
    desc: "Procedural / Participial State ('processed / steeped')",
  },
  {
    match: 'y',
    label: '-y',
    desc: "Nominal / Label Closure ('that which is named')",
  },
];

const STEM_GLOSSES: Record<string, string> = {
  oror: "Blood-red Alkanet / Madder dye-root (Alkanna tinctoria)",
  orar: 'Red Alkanet root-extract',
  doaro: 'The Pleiades (7-star cluster in Taurus, f68r3)',
  darary: 'The main taproot / rhizome (labeled on f89r2)',
  olkol: 'The core water-pipe / bath conduit liquid (labeled on f82v)',
  okoldy: 'Infused in the storage jar / water conduit (labeled on f82v & f89r2)',
  poldchody: 'Begin by steeping in the liquid vessel (Red-Blossom headword on f11v & f116v)',
  fachys: "Opening declaration ('Here begins the book/manifesto')",
  ke: 'Boil / decoct / simmer with heat',
  kee: 'Boil / cook thoroughly in liquid',
  k: 'Core thermal / boiling stem',
  ch: 'Herbal infusion / strained decoction',
  sh: 'Bath / liquid surface washing',
  kar: 'Heart / core / root-bulb',
  kor: 'Root-heart / bulbous core',
  kair: 'Pure core / heart-essence',
  tar: 'Earth / primary root base',
  cthar: 'Divided / extracted root-heart',
  ckhar: 'Concentrated heart-extract',
  ra: 'Root / taproot / rhizome',
  rar: 'Main rootstock',
  dara: 'Main root portion',
  opchor: 'Vessel-infused pharmaceutical compound (f16v -> f89r1 hub)',
  pchor: 'Infused plant compound',
  al: 'Star / winged seed / volatile essence',
  kal: 'Primary core / star essence',
  sal: 'Cut leaf / seed rosette',
  ol: 'Liquid vessel / bath basin',
  tol: 'Liquid extract medium',
  kol: 'Core storage vessel / pipe conduit',
  aiin: 'One measured dose / portion',
  daiin: 'Take one measured dose',
  dain: 'Take this measured portion',
  otam: 'Complete / seal the final mixture',
  okam: 'Complete the core preparation',
  daram: 'Take the root to completion',
};

export function parseVoynichWord(raw: string): ParsedVoynichWord | null {
  const w = (raw || '').trim();
  if (!w) return null;
  const lower = w.toLowerCase();

  if (lower === 'oror') {
    return {
      word: w,
      prefix: '∅ (Base Noun)',
      prefixDesc: 'Unprefixed pure botanical noun',
      stem: 'oror',
      stemDesc: "Blood-red Dyer's Alkanet / Madder root (f102v2 & f116v)",
      suffix: '-or (Reduplicated)',
      suffixDesc: 'Red/golden dye-root stem (or-or)',
      gloss: 'Blood-red Alkanet / Madder root (Alkanna tinctoria · Rosetta crib on f102v2 & f116v)',
    };
  }
  if (lower === 'doaro') {
    return {
      word: w,
      prefix: 'd-',
      prefixDesc: 'Demonstrative / Star Cluster Marker',
      stem: 'oar',
      stemDesc: 'Clustered golden stars (Pleiades)',
      suffix: '-o',
      suffixDesc: 'Astronomical emblem label ending',
      gloss: 'The Pleiades (Seven Sisters 7-star cluster in Taurus on f68r3)',
    };
  }
  if (lower === 'daiin' || lower === 'dain') {
    return {
      word: w,
      prefix: 'd-',
      prefixDesc: "Imperative / Ablative ('Take / From')",
      stem: 'aiin / ain',
      stemDesc: "Counted minim unit ('one part / measure')",
      suffix: '-iin',
      suffixDesc: 'Partitive dose marker',
      gloss: "'Take one measured part / dose of...'",
    };
  }

  let prefix = '∅ (Base)';
  let prefixDesc = 'Direct stem / unprefixed form';
  let rest = lower;

  for (const p of PREFIX_RULES) {
    if (rest.startsWith(p.match) && rest.length > p.match.length + 1) {
      prefix = p.label;
      prefixDesc = p.desc;
      rest = rest.slice(p.match.length);
      break;
    }
  }

  let suffix = '∅ (Base)';
  let suffixDesc = 'Direct nominal / base state';
  for (const s of SUFFIX_RULES) {
    if (rest.endsWith(s.match) && rest.length > s.match.length) {
      suffix = s.label;
      suffixDesc = s.desc;
      rest = rest.slice(0, rest.length - s.match.length);
      break;
    }
  }

  const stem = rest || lower;
  const stemDesc =
    STEM_GLOSSES[lower] || STEM_GLOSSES[stem] || `Botanical / pharmaceutical root stem (${stem})`;

  let gloss: string;
  if (STEM_GLOSSES[lower]) {
    gloss = STEM_GLOSSES[lower];
  } else {
    const pShort = prefixDesc.split('(')[1]
      ? prefixDesc.split('(')[1].replace(')', '')
      : prefixDesc;
    const sShort = suffixDesc.split('(')[1]
      ? suffixDesc.split('(')[1].replace(')', '')
      : suffixDesc;
    gloss = `${pShort} + [${stemDesc}] + ${sShort}`;
  }

  return { word: w, prefix, prefixDesc, stem, stemDesc, suffix, suffixDesc, gloss };
}

export function glossEvaLine(eva: string): string {
  return eva
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .map((tok) => {
      const p = parseVoynichWord(tok);
      return p ? `${tok} (${p.stem})` : tok;
    })
    .join(' · ');
}

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitMarkdownTableRow(trimmed: string): string[] {
  const inner = trimmed.slice(1, -1);
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  let inMath = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '\\' && i + 1 < inner.length) {
      if (inner[i + 1] === '|') {
        cur += '|';
        i++;
        continue;
      }
      cur += ch + inner[i + 1];
      i++;
      continue;
    }
    if (ch === '`') {
      inCode = !inCode;
      cur += ch;
      continue;
    }
    if (ch === '$' && !inCode) {
      inMath = !inMath;
      cur += ch;
      continue;
    }
    if (ch === '|' && !inCode && !inMath) {
      if (inner[i + 1] === '|') {
        cur += '||';
        i++;
        continue;
      }
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }

  cells.push(cur.trim());
  return cells;
}

function cleanCodeSpanContent(rawCode: string): string {
  let c = rawCode
    .replace(/<->/g, '↔')
    .replace(/^<(f\d+[rv]\d*[^>]*)>$/i, '$1')
    .replace(/^<%> PAR_OPEN$/i, 'Paragraph Start')
    .replace(/^<\$> PAR_END$/i, 'Paragraph End')
    .replace(/^\$I=([A-Z])$/, 'Section $1')
    .replace(/^\$I=(.+)$/, '$1')
    .replace(/^\$L=([AB])$/, 'Lang $1')
    .replace(/^\$H=([0-9./-]+)$/, 'Hand $1')
    .replace(/^\$Q=([A-Z0-9.-]+)$/, 'Quire $1')
    .replace(/\b\$I=([A-Z])\b/g, 'Section $1')
    .replace(/\b\$L=([AB])\b/g, 'Lang $1')
    .replace(/\b\$H=([0-9./-]+)\b/g, 'Hand $1')
    .replace(/\b\$Q=([A-Z0-9.-]+)\b/g, 'Quire $1');

  // Humanize structural POS tags in interlinear-glosses
  c = c
    .replace(/^\[BARE_NOMINAL\(oX\):([^\]]+)\]$/, '$1 (o- nominal)')
    .replace(/^\[Q_NOMINAL\(q\+oX\):([^\]]+)\]$/, '$1 (qo- active)')
    .replace(/^\[VERB\/STATE_MOD\(-dy\/-y\):([^\]]+)\]$/, '$1 (-dy/-y verb)')
    .replace(/^\[GALLOWS_HEAD:([^\]]+)\]$/, '$1 (gallows opener)')
    .replace(/^\[BENCH_STEM:([^\]]+)\]$/, '$1 (ch-/sh- stem)')
    .replace(/^\[LINK\/PREP:([^\]]+)\]$/, '$1 (linker)')
    .replace(/^\[DET\/CLOSER:([^\]]+)\]$/, '$1 (measure/closer)')
    .replace(/^\[FRAME_MOD:([^\]]+)\]$/, '$1 (frame modifier)')
    .replace(/^\[CLAUSE_CLOSER\(-m\):([^\]]+)\]$/, '$1 (-m closer)')
    .replace(/^\[STEM:([^\]]+)\]$/, '$1 (stem)');

  return c;
}

function cleanOutsideCodeSegment(seg: string): string {
  let s = seg
    .replace(/<->/g, '↔')
    .replace(/\s+->\s+/g, ' → ');

  // Convert unbackticked <XREF DOMAIN [locus 'word', MS_cnt=N]> into clean inline code badges
  s = s.replace(
    /<XREF\s+([A-Z/]+)\s+\[([^\]]+)\]>/g,
    (_m, domain: string, details: string) => {
      const cleanDetails = details.replace(/,\s*MS_cnt=(\d+)/, ' ($1×)');
      return `\`Cross-Ref ${domain}: ${cleanDetails}\``;
    },
  );

  // Convert unbackticked IVTFF locus tags (<f102v1.2>, <f66r.16,@L>) and markers (<%>, <$>) into inline code
  s = s
    .replace(/<(f\d+[rv]\d*[^>\s]*)>/g, '`$1`')
    .replace(/<fRos\.(\d+[^>\s]*)>/g, '`fRos.$1`')
    .replace(/\(\s*<%>\s*\)/g, '')
    .replace(/\(\s*<\$>\s*\)/g, '')
    .replace(/<%>\s*/g, '')
    .replace(/<\$>\s*/g, '');

  // Escape any remaining non-HTML angle-bracket glosses (e.g. <SPRING-NOM[o-]+...>) into inline code so browsers don't swallow them
  s = s.replace(
    /<(?!(?:\/?(?:br|div|strong|em|code|span)\b))([A-Za-z0-9_%$!@-][^>\n]{1,90})>/g,
    '`<$1>`',
  );

  // Format inline LaTeX math ($...$) ONLY outside backticks so $I= and $L= inside backticks never collide
  s = s.replace(/\$([^$\n]+)\$/g, (_m, expr: string) => {
    const cleaned = expr
      .replace(/\\chi\^2/g, 'χ²')
      .replace(/\\times/g, '×')
      .replace(/\\approx/g, '≈')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\pm/g, '±')
      .replace(/\\to/g, '→')
      .replace(/\\sum/g, '∑')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\mathtt\{([^}]*)\}/g, '$1')
      .trim();
    return `*${cleaned}*`;
  });

  return s;
}

function preprocessVoynichLine(rawLine: string): string {
  const line = rawLine
    // Omit unknown PDF p? placeholders in early folio headers
    .replace(/,\s*PDF\s+`p\?`/gi, '')
    // Strip redundant italicized rule-trace repeats in interlinear-glosses
    .replace(
      /\s*\*\[(?:TOP_LINE_GALLOWS|Q_PROCLITIC|INITIAL_Y_PROCLITIC|RIGHT_MARGIN_M_CLOSER)[^\]]*\]\*/g,
      '',
    )
    // Strip internal s_tol/s_kol state-machine prefixes inside parentheticals
    .replace(/\(`?s_[a-z0-9_/\s]+`?\s+([^)]+)\)/g, '($1)')
    .replace(/`?s_[a-z0-9_]+(?:\s*\/\s*s_[a-z0-9_]+)*`?\s+/g, '');

  // Split by inline code spans (`...`) so code spans and prose text are normalized independently
  const parts = line.split(/(`[^`]+`)/g);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = cleanCodeSpanContent(part.slice(1, -1));
      parts[i] = `\`${inner}\``;
    } else if (part) {
      parts[i] = cleanOutsideCodeSegment(part);
    }
  }
  return parts.join('');
}

function preprocessVoynichMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inCodeBlock = false;
  let tableHeaderCols = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      tableHeaderCols = 0;
      out.push(rawLine);
      continue;
    }

    if (inCodeBlock) {
      out.push(rawLine);
      continue;
    }

    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      tableHeaderCols = 0;
      out.push(
        '<div class="callout-box"><strong>Prefix</strong> (Action / Role) &nbsp;+&nbsp; <strong>Root Stem</strong> (Plant / Star / Vessel) &nbsp;+&nbsp; <strong>Suffix</strong> (Case / Dose)</div>',
      );
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const rawCells = splitMarkdownTableRow(trimmed);
      const isSeparator = rawCells.every((c) => /^[:\-\s]+$/.test(c));
      if (!tableHeaderCols) {
        tableHeaderCols = rawCells.length;
      }
      if (isSeparator) {
        const sepCells = Array.from(
          { length: tableHeaderCols },
          (_, idx) => rawCells[idx] || '---',
        );
        out.push(`| ${sepCells.join(' | ')} |`);
        continue;
      }
      const clampedCells =
        rawCells.length > tableHeaderCols
          ? [
              ...rawCells.slice(0, tableHeaderCols - 1),
              rawCells.slice(tableHeaderCols - 1).join(' · '),
            ]
          : Array.from({ length: tableHeaderCols }, (_, idx) => rawCells[idx] ?? '');

      // Normalize each cell and escape any internal | as \| for GFM table compliance
      const formattedCells = clampedCells.map((cell) =>
        preprocessVoynichLine(cell).replace(/\\?\|/g, '\\|'),
      );
      out.push(`| ${formattedCells.join(' | ')} |`);
      continue;
    } else {
      tableHeaderCols = 0;
    }

    out.push(preprocessVoynichLine(rawLine));
  }

  return out.join('\n');
}

const voynichRenderer = new Renderer();

voynichRenderer.heading = function ({ tokens, depth }: Tokens.Heading): string {
  const level = depth === 1 ? 1 : depth === 2 ? 2 : 3;
  const inner = this.parser.parseInline(tokens);
  return `<h${level}>${inner}</h${level}>\n`;
};

voynichRenderer.table = function (token: Tokens.Table): string {
  const defaultTable = Renderer.prototype.table.call(this, token);
  return `<div class="table-wrap">${defaultTable}</div>\n`;
};

voynichRenderer.image = function ({ href, text }: Tokens.Image): string {
  const rawSrc = href || '';
  const base = rawSrc.split('/').pop() || rawSrc;
  const resolved = rawSrc.includes('pages/') ? `/pages/${base}` : rawSrc;
  const displaySrc = resolved.startsWith('/pages/') ? `${resolved}?format=webp&w=960` : resolved;
  return `<img src="${escapeHtml(displaySrc)}" alt="${escapeHtml(text || '')}" width="640" height="850" loading="lazy" decoding="async" data-zoom="${escapeHtml(resolved)}" />`;
};

voynichRenderer.link = function ({ href, tokens }: Tokens.Link): string {
  const rawHref = href || '';
  const label = this.parser.parseInline(tokens);
  if (rawHref.endsWith('.md')) {
    const base = rawHref.split('/').pop() || '';
    const slug = base.replace(/\.md$/i, '').toLowerCase().replace(/_/g, '-');
    const mappedSlug = slug === 'notes' ? 'notes-master-research-log' : slug;
    return `<a href="/voynich/library?subtab=docs&amp;doc=${escapeHtml(mappedSlug)}" data-doc-slug="${escapeHtml(mappedSlug)}">${label}</a>`;
  }
  if (rawHref.includes('pages/')) {
    const base = rawHref.split('/').pop() || rawHref;
    const imgUrl = `/pages/${base}`;
    return `<a href="${escapeHtml(imgUrl)}" data-zoom="${escapeHtml(imgUrl)}">${label}</a>`;
  }
  if (rawHref.includes('data/')) {
    const base = rawHref.split('/').pop() || rawHref;
    return `<a href="/data/${escapeHtml(base)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }
  return `<a href="${escapeHtml(rawHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
};

const voynichMarked = new Marked({
  gfm: true,
  breaks: false,
  renderer: voynichRenderer,
});

export function renderMarkdownToHtml(md: string): string {
  const preprocessed = preprocessVoynichMarkdown(md);
  return voynichMarked.parse(preprocessed, { async: false }) as string;
}

