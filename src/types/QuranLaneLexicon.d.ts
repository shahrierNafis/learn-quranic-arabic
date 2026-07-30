export interface QuranLaneLexicon {
  metadata: Metadata;
  roots: Root2[];
}

export interface Metadata {
  export_date: string;
  total_roots: number;
  version: string;
  source: string;
  statistics: Statistics;
}

export interface Statistics {
  has_definition_en: number;
  has_definition_tr: number;
  has_summary_tr: number;
  has_summary_en: number;
  lane_matches: number;
  corpus_only: number;
}

export interface Root2 {
  id: number;
  root: string;
  root_buckwalter: string;
  definition_en?: string;
  definition_tr?: string;
  summary_tr: string;
  summary_en: string;
  semantic_field: any;
  morphological_forms: MorphologicalForm[];
  related_roots: any;
  quran_frequency: number;
  source: string;
  lane_match_type?: string;
  lane_volume?: number;
  confidence: string;
  tr_translation_source?: string;
  tr_translation_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface MorphologicalForm {
  form_pattern: string;
  form_arabic: string;
  form_name: string;
  form_category: string;
  example_word: string;
  occurrences: number;
}
