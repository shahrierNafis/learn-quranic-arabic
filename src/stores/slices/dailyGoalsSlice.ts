// src/stores/slices/coloursSlice.ts
import { StateCreator } from "zustand";
import { DailyGoalsSlice, PreferenceStore } from "../types";
import {} from "../types";

export const createDailyGoalsSlice: StateCreator<PreferenceStore, [], [], DailyGoalsSlice> = (set) => ({
  date: new Date().toISOString().split("T")[0],
  dailyXP: 0,
  dailyXPGoal: 1000,
  dailyXpStreak: 0,
  dailyQuranVerseCount: 0,
  dailyQuranVerseCountGoal: 10,
  dailyQuranVerseCountStreak: 0,
  dailyFrequencyListVerseCount: 0,
  dailyFrequencyListVerseCountGoal: 10,
  dailyFrequencyListVerseCountStreak: 0,
  dailyQuranProgressPercentage: 0,
  dailyQuranProgressPercentageGoal: 0.25,
  dailyQuranProgressPercentageStreak: 0,
});
