// src/stores/slices/coloursSlice.ts
import { StateCreator } from "zustand";
import { ColoursSlice, PreferenceStore } from "../types";
import { defaultColours } from "../constants";

export const createColoursSlice: StateCreator<PreferenceStore, [], [], ColoursSlice> = (set) => ({
  colours: defaultColours,
  setColours: (pos, value, value2) => {
    set((state) => ({ colours: { ...state.colours, [pos]: [value, value2] } }));
  },
  resetColours: () => set(() => ({ colours: defaultColours })),
});
