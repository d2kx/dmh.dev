export interface WalkthroughClause {
  readonly locus: string;
  readonly eva: string;
  readonly english: string;
}

export interface WalkthroughFolio {
  readonly folio: string;
  readonly title: string;
  readonly section: string;
  readonly pdf_page: number;
  readonly image: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly secondary_image?: string;
  readonly secondaryImageWidth?: number;
  readonly secondaryImageHeight?: number;
  readonly summary: string;
  readonly clauses: readonly WalkthroughClause[];
  readonly labels: readonly string[];
}

export interface SpecimenEntry {
  readonly id: string;
  readonly folio: string;
  readonly section: string;
  readonly pdf_page: number;
  readonly category: string;
  readonly common_name: string;
  readonly latin_candidates: readonly string[];
  readonly medieval_herbal_parallels: readonly string[];
  readonly visual_diagnostics: readonly string[];
  readonly voynich_stems: {
    readonly opening_word: string;
    readonly dominant_roots: readonly string[];
    readonly cross_section_echoes: readonly string[];
  };
  readonly plain_english_dossier: string;
  readonly confidence_tier: string;
  readonly imageUrl: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
}

export interface LexiconEntry {
  readonly stem: string;
  readonly category: string;
  readonly meaning: string;
  readonly examples: string;
  readonly sections: string;
  readonly grounding: string;
}

export interface ParadigmCase {
  readonly case: string;
  readonly suffix: string;
  readonly form: string;
  readonly count: number;
  readonly pct: number;
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
  readonly european_month_gloss: string;
  readonly triplicity: string;
  readonly season: string;
  readonly scan_image: string;
  readonly ring_token_count: number;
  readonly nymph_label_count: number;
  readonly top_ring_words: readonly string[];
  readonly top_nymph_labels: readonly string[];
  readonly o_prefix_rate: number;
  readonly y_prefix_rate: number;
  readonly liquid_ol_or_rate: number;
  readonly essence_al_ar_rate: number;
}

export interface BalneoEntry {
  readonly folio: string;
  readonly prose_tokens: number;
  readonly nymph_labels: readonly string[];
  readonly tube_labels: readonly string[];
  readonly thermal_boil_rate: number;
  readonly wash_bathe_rate: number;
  readonly pool_vessel_rate: number;
  readonly top_prose_words: readonly string[];
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
  readonly width: number;
  readonly height: number;
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
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly license: string;
  readonly downloadUrl: string;
  readonly githubBlobUrl: string;
}

export interface CatalogData {
  readonly docs: readonly DocMeta[];
  readonly pages: readonly ScanCatalogItem[];
  readonly dataFiles: readonly DataFileCatalogItem[];
  readonly books: readonly BookCatalogItem[];
}
