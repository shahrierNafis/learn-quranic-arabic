// src/stores/slices/displayPreferencesSlice.ts
import { StateCreator } from "zustand";
import { DisplayPreferencesSlice, PreferenceStore } from "../types";

export const createDisplayPreferencesSlice: StateCreator<
  PreferenceStore,
  [["zustand/immer", never], ["zustand/persist", unknown]], // Matches the root middleware setup
  [],
  DisplayPreferencesSlice
> = (set) => ({
  translation_ids: ["149"],
  setTranslation_ids: (translation_ids: string[]) => set({ translation_ids }),

  showTranslation: false,
  setShowTranslation: (showTranslation: boolean) => set({ showTranslation }),

  showTranslationOnHiddenWords: false,
  setShowTranslationOnHiddenWords: (showTranslationOnHiddenWords: boolean) => set({ showTranslationOnHiddenWords }),

  showTransliteration: false,
  setShowTransliteration: (showTransliteration: boolean) => set({ showTransliteration }),

  font: "Noto_Sans_Arabic",
  setFont: (font) => set({ font }),
});
