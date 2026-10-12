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

function formatInlineMarkdown(line: string): string {
  let out = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, rawSrc: string) => {
    const base = rawSrc.split('/').pop() || rawSrc;
    const resolved = rawSrc.includes('pages/') ? `/pages/${base}` : rawSrc;
    return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(alt)}" width="640" height="850" decoding="async" data-zoom="${escapeHtml(resolved)}" />`;
  });

  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
    if (href.endsWith('.md')) {
      const base = href.split('/').pop() || '';
      const slug = base.replace(/\.md$/i, '').toLowerCase().replace(/_/g, '-');
      const mappedSlug = slug === 'notes' ? 'notes-master-research-log' : slug;
      return `<a href="/voynich/library?doc=${escapeHtml(mappedSlug)}" data-doc-slug="${escapeHtml(mappedSlug)}">${label}</a>`;
    }
    if (href.includes('pages/')) {
      const base = href.split('/').pop() || href;
      const imgUrl = `/pages/${base}`;
      return `<a href="${escapeHtml(imgUrl)}" data-zoom="${escapeHtml(imgUrl)}">${label}</a>`;
    }
    if (href.includes('data/')) {
      const base = href.split('/').pop() || href;
      return `<a href="/data/${escapeHtml(base)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  out = out.replace(/\$([^$]+)\$/g, (_m, expr: string) => {
    const cleaned = expr
      .replace(/\\chi\^2/g, 'χ²')
      .replace(/\\times/g, '×')
      .replace(/\\approx/g, '≈')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\pm/g, '±')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\mathtt\{([^}]*)\}/g, '$1')
      .trim();
    return `<em>${escapeHtml(cleaned)}</em>`;
  });

  out = out.replace(/`([^`]+)`/g, (_m, codeText: string) => {
    return `<code>${escapeHtml(codeText)}</code>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return out;
}

export function renderMarkdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const html: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inList: 'ul' | 'ol' | null = null;

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return;
    inTable = false;
    const header = tableRows[0];
    const body = tableRows.slice(1).filter((r) => !r.every((c) => /^[:\-\s]+$/.test(c)));
    html.push('<div class="table-wrap"><table><thead><tr>');
    for (const h of header) {
      html.push(`<th>${formatInlineMarkdown(h.trim())}</th>`);
    }
    html.push('</tr></thead><tbody>');
    for (const row of body) {
      html.push('<tr>');
      for (const cell of row) {
        html.push(`<td>${formatInlineMarkdown(cell.trim())}</td>`);
      }
      html.push('</tr>');
    }
    html.push('</tbody></table></div>');
    tableRows = [];
  };

  const flushList = () => {
    if (!inList) return;
    html.push(`</${inList}>`);
    inList = null;
  };

  for (const rawLine of lines) {
    if (rawLine.trim().startsWith('```')) {
      flushTable();
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();

    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      flushTable();
      flushList();
      html.push(
        `<div class="callout-box"><strong>Prefix</strong> (Action / Role) &nbsp;+&nbsp; <strong>Root Stem</strong> (Plant / Star / Vessel) &nbsp;+&nbsp; <strong>Suffix</strong> (Case / Dose)</div>`,
      );
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const rawLevel = headingMatch[1].length;
      const level = rawLevel === 1 ? 1 : rawLevel === 2 ? 2 : 3;
      html.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushList();
      html.push(`<p>${formatInlineMarkdown(trimmed.replace(/^>\s*/, ''))}</p>`);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
        html.push('<ul>');
      }
      html.push(`<li>${formatInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${formatInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  flushTable();
  flushList();
  return html.join('\n');
}
