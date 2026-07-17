// src/stores/slices/arSlice.ts
import { StateCreator } from "zustand";
import { ARSlice, PreferenceStore } from "../types";

const initialQuranProgress = Object.fromEntries(
  Array.from({ length: 114 }, (_, i) => i + 1).map((chapter) => [chapter, 0]),
);

export const createARSlice: StateCreator<
  PreferenceStore,
  [["zustand/immer", never], ["zustand/persist", unknown]], // Matches the root middleware setup
  [],
  ARSlice
> = (set) => ({
  QuranProgress: initialQuranProgress,
  setQuranProgress: (chapter: number, progress: number) => {
    set((state) => {
      state.QuranProgress[chapter] = progress;
    });
  },
  addQuranProgress: (chapter: number, progress: number) => {
    set((state) => {
      state.QuranProgress[chapter] += progress;
    });
  },
  resetQuranProgress: () => set({ QuranProgress: { ...initialQuranProgress } }),
});
