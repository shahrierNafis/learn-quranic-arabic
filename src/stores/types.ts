// src/stores/types.ts
import { Card } from "ts-fsrs";
import { fontNames } from "@/utils/fontNames";

export type reviewOrderType = "next_review ASC" | "next_review DESC" | "level ASC" | "level DESC" | "random";

// ---- Individual slice state/actions ----

export type DisplayPreferencesSlice = {
  translation_ids: string[];
  setTranslation_ids: (translation_ids: string[]) => void;
  showTranslation: boolean;
  setShowTranslation: (showTranslation: boolean) => void;
  showTranslationOnHiddenWords: boolean;
  setShowTranslationOnHiddenWords: (showTranslationOnHiddenWords: boolean) => void;
  showTransliteration: boolean;
  setShowTransliteration: (showTransliteration: boolean) => void;
  font: (typeof fontNames)[number];
  setFont: (font: (typeof fontNames)[number]) => void;
};

export type ColoursSlice = {
  colours: { [key: string]: [string, string] };
  setColours: (pos: string, value: string, value2: string) => void;
  resetColours: () => void;
};

export type ARSlice = {
  QuranProgress: { [key: number]: number };
  setQuranProgress: (chapter: number, progress: number) => void;
  addQuranProgress: (chapter: number, progress: number) => void;
  resetQuranProgress: () => void;
};

export type MiscSlice = {
  lastModified: Date;
  highlightedRoots: string[];
  ranks: number[];
  reciter_id: string;
  setReciter_id: (reciterId: string) => void;
  reviewOrder: reviewOrderType;
  setReviewOrder: (reviewOrder: reviewOrderType) => void;
};

export type GoalRecord = {
  value: number;
  name: string;
  goal: number;
  streak: number;
};

export type DailyGoalsSlice = {
  date: string;
  goalRecords: {
    [key: string]: GoalRecord;
  };
};
export type FSRSSlice = {
  rootGroupsByFirstLetter: { [key: string]: Card };
};
// ---- Combined store type ----

export type PreferenceStore = DisplayPreferencesSlice &
  ColoursSlice &
  ARSlice &
  MiscSlice &
  DailyGoalsSlice &
  FSRSSlice;
