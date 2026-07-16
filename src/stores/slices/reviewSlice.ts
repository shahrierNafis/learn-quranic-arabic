// src/stores/slices/reviewSlice.ts
import { StateCreator } from "zustand";
import { PreferenceStore, ReviewSlice } from "../types";

export const createReviewSlice: StateCreator<PreferenceStore, [], [], ReviewSlice> = (set) => ({
  reviewOrder: "next_review ASC",
  setReviewOrder: (reviewOrder) => set({ reviewOrder }),

  reciter_id: 7 + "",
  setReciter_id: (reciter_id) => set({ reciter_id }),
});
