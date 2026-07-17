// src/stores/slices/coloursSlice.ts
import { StateCreator } from "zustand";
import { DailyGoalsSlice, PreferenceStore } from "../types";
import {} from "../types";

export const createDailyGoalsSlice: StateCreator<
  PreferenceStore,
  [["zustand/immer", never], ["zustand/persist", unknown]], // Matches the root middleware setup
  [],
  DailyGoalsSlice
> = (set) => ({
  date: new Date().toISOString().split("T")[0],
  goalRecords: {
    xp: { value: 0, name: "XP", goal: 1000, streak: 0 },
    verse: { value: 0, name: "Quran Verse Count", goal: 10, streak: 0 },
    word: { value: 0, name: "Frequency List Verse Count", goal: 100, streak: 0 },
  },
});
