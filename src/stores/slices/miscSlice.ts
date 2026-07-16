// src/stores/slices/miscSlice.ts
import { StateCreator } from "zustand";
import { MiscSlice, PreferenceStore } from "../types";

export const createMiscSlice: StateCreator<PreferenceStore, [], [], MiscSlice> = () => ({
  lastModified: new Date(),
  highlightedRoots: [],
  ranks: [0],
});
