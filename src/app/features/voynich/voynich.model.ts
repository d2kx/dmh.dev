export interface WalkthroughLine {
  readonly locus: string;
  readonly role: string;
  readonly eva: string;
  readonly gloss: string;
  readonly plain: string;
}

export interface WalkthroughLabel {
  readonly word: string;
  readonly locus: string;
  readonly gloss: string;
}

export interface WalkthroughFolio {
  readonly id: string;
  readonly title: string;
  readonly badge: string;
  readonly section: string;
  readonly image: string;
  readonly secondary_image?: string;
  readonly caption: string;
  readonly summary: string;
  readonly labels: readonly WalkthroughLabel[];
  readonly lines: readonly WalkthroughLine[];
}

export interface SpecimenEntry {
  readonly folio: string;
  readonly species: string;
  readonly common: string;
  readonly family: string;
  readonly headword: string;
  readonly headword_gloss: string;
  readonly labels: string;
  readonly cues: string;
  readonly use: string;
  readonly cross_ref: string;
  readonly confidence: string;
  readonly imageUrl: string;
}

export interface LexiconEntry {
  readonly word: string;
  readonly morph: string;
  readonly category: string;
  readonly count: number;
  readonly meaning: string;
  readonly evidence: string;
}

export interface ParadigmCase {
  readonly case: string;
  readonly suffix: string;
  readonly form: string;
  readonly count: number;
  readonly gloss: string;
}

export interface ParadigmRoot {
  readonly root: string;
  readonly domain: string;
  readonly base_meaning: string;
  readonly total: number;
  readonly cases: readonly ParadigmCase[];
}

export interface ZodiacEntry {
  readonly folio: string;
  readonly sign: string;
  readonly month: string;
  readonly lang: string;
  readonly nymphs: number;
  readonly sample_labels: string;
  readonly gloss: string;
}

export interface BalneoEntry {
  readonly folio: string;
  readonly title: string;
  readonly words: number;
  readonly qok_rate: string;
  readonly ol_rate: string;
  readonly labels_count: number;
  readonly key_labels: string;
  readonly summary: string;
}

export interface WordConcordanceEntry {
  readonly c: number;
  readonly f: readonly string[];
}

export interface ExplorerData {
  readonly folios: readonly WalkthroughFolio[];
  readonly specimens: readonly SpecimenEntry[];
  readonly lexicon: readonly LexiconEntry[];
  readonly paradigms: readonly ParadigmRoot[];
  readonly zodiac: readonly ZodiacEntry[];
  readonly balneo: readonly BalneoEntry[];
  readonly wordConcordance: Record<string, WordConcordanceEntry>;
}

export interface CorpusLine {
  readonly locus: string;
  readonly tag: string;
  readonly eva: string;
}

export interface CorpusFolio {
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
  readonly labels: readonly string[];
  readonly titles: readonly string[];
  readonly scans: readonly string[];
  readonly lines: readonly CorpusLine[];
}

export interface CorpusData {
  readonly summary: {
    readonly transcribed_folios: number;
    readonly total_words: number;
    readonly total_labels: number;
    readonly total_drawing_intrusions: number;
  };
  readonly folios: readonly CorpusFolio[];
}

export interface DocMeta {
  readonly slug: string;
  readonly sourcePath: string;
  readonly title: string;
  readonly summary: string;
  readonly category: string;
  readonly pinnedOrder: number;
  readonly sizeKB: number;
}

export interface DocFull extends DocMeta {
  readonly markdown: string;
}

export interface ScanCatalogItem {
  readonly file: string;
  readonly url: string;
  readonly folio: string;
  readonly sizeKB: number;
  readonly isEnhanced: boolean;
}

export interface DataFileCatalogItem {
  readonly file: string;
  readonly url: string;
  readonly attackNum: number | null;
  readonly label: string;
  readonly ext: string;
  readonly sizeKB: number;
}

export interface BookCatalogItem {
  readonly id: string;
  readonly name: string;
  readonly file: string;
  readonly pages: number;
  readonly resolution: string;
  readonly sizeMB: number;
  readonly description: string;
  readonly downloadUrl: string;
  readonly githubBlobUrl: string;
}

export interface CatalogData {
  readonly docs: readonly DocMeta[];
  readonly pages: readonly ScanCatalogItem[];
  readonly dataFiles: readonly DataFileCatalogItem[];
  readonly books: readonly BookCatalogItem[];
}
