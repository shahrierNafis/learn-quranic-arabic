// src/stores/types.ts
import { Card } from "ts-fsrs";
import { fontNames } from "@/utils/fontNames";

export type reviewOrderType = "next_review ASC" | "next_review DESC" | "level ASC" | "level DESC" | "random";

export type WordListEntry = { card: Card; index: string; isSuspended: boolean };

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

export type ReviewSlice = {
  reviewOrder: reviewOrderType;
  setReviewOrder: (reviewOrder: reviewOrderType) => void;
  reciter_id: string;
  setReciter_id: (reciter_id: string) => void;
};

export type ARSlice = {
  QuranProgress: { [key: number]: number };
  setQuranProgress: (chapter: number, progress: number) => void;
  addQuranProgress: (chapter: number, progress: number) => void;
  resetQuranProgress: () => void;
};

export type WordListSlice = {
  wordList: { [key: string]: WordListEntry };
  addToWordList: (key: string, word: { card: Card; index: string; isSuspended?: boolean }) => void;
  updateCard: (key: string, card: Card) => void;
  toggleSuspend: (key: string) => void;
  removeFromWordList: (key: string) => void;
  resetWordList: () => void;
};

export type MiscSlice = {
  lastModified: Date;
  highlightedRoots: string[];
  ranks: number[];
};

export type DailyGoalsSlice = {
  date: string;
  dailyXP: number;
  dailyXPGoal: number;
  dailyXpStreak: number;
  dailyQuranVerseCount: number;
  dailyQuranVerseCountGoal: number;
  dailyQuranVerseCountStreak: number;
  dailyFrequencyListVerseCount: number;
  dailyFrequencyListVerseCountGoal: number;
  dailyFrequencyListVerseCountStreak: number;
  dailyQuranProgressPercentage: number;
  dailyQuranProgressPercentageGoal: number;
  dailyQuranProgressPercentageStreak: number;
};

// ---- Combined store type ----

export type PreferenceStore = DisplayPreferencesSlice &
  ColoursSlice &
  ReviewSlice &
  ARSlice &
  WordListSlice &
  MiscSlice &
  DailyGoalsSlice;
