// src/stores/counter-store.ts
import { persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import superjson from "superjson";
import { pullFromTheServer, useUserDataOutOfSyncStore } from "@/components/UserDataOutOfSync";

import { PreferenceStore } from "./types";
import { storage, supabase } from "./storage";

import { createDisplayPreferencesSlice } from "./slices/displayPreferencesSlice";
import { createColoursSlice } from "./slices/coloursSlice";
import { createReviewSlice } from "./slices/reviewSlice";
import { createARSlice } from "./slices/arSlice";
import { createWordListSlice } from "./slices/wordListSlice";
import { createMiscSlice } from "./slices/miscSlice";
import { createDailyGoalsSlice } from "./slices/dailyGoalsSlice";

const dayjs = require("dayjs");

export const useOnlineStorage = createWithEqualityFn<PreferenceStore>()(
  persist(
    (...a) => ({
      ...createDisplayPreferencesSlice(...a),
      ...createColoursSlice(...a),
      ...createReviewSlice(...a),
      ...createARSlice(...a),
      ...createWordListSlice(...a),
      ...createMiscSlice(...a),
      ...createDailyGoalsSlice(...a),
    }),
    {
      version: 8,
      name: "preference-storage",
      storage: storage,
      // skipHydration: true,
    },
  ),
);

useOnlineStorage.persist.onHydrate(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase.from("user_preference").select("*").single();
    if (!error && data.preference) {
      const serverState = (superjson.parse(data.preference as string) as any).state as PreferenceStore;
      if (useOnlineStorage.getState().lastModified > serverState.lastModified) {
        useUserDataOutOfSyncStore.getState().setOpen(true);
      } else if (useOnlineStorage.getState().lastModified < serverState.lastModified) pullFromTheServer();
    }
  }

  // increase streak
  const diff = dayjs().diff(dayjs(useOnlineStorage.getState().date), "day");
  if (diff >= 1) {
    useOnlineStorage.setState(() => ({
      date: dayjs().format("YYYY-MM-DD"),
      dailyXP: 0,
      dailyQuranVerseCount: 0,
      dailyFrequencyListVerseCount: 0,
      dailyQuranProgressPercentage: 0,
    }));
  }
  if (diff === 1) {
    if (useOnlineStorage.getState().dailyXP >= useOnlineStorage.getState().dailyXPGoal) {
      // Handle the case where XP goal is met
      useOnlineStorage.setState((state) => ({
        dailyXpStreak: state.dailyXpStreak + 1,
      }));
    }
    if (useOnlineStorage.getState().dailyQuranVerseCount >= useOnlineStorage.getState().dailyQuranVerseCountGoal) {
      // Handle the case where Quran verse goal is met
      useOnlineStorage.setState((state) => ({
        dailyQuranVerseCountStreak: state.dailyQuranVerseCountStreak + 1,
      }));
    }
    if (
      useOnlineStorage.getState().dailyQuranProgressPercentage >=
      useOnlineStorage.getState().dailyQuranProgressPercentageGoal
    ) {
      // Handle the case where Quran progress percentage goal is met
      useOnlineStorage.setState((state) => ({
        dailyQuranProgressPercentageStreak: state.dailyQuranProgressPercentageStreak + 1,
      }));
    }
    if (
      useOnlineStorage.getState().dailyFrequencyListVerseCount >=
      useOnlineStorage.getState().dailyFrequencyListVerseCountGoal
    ) {
      // Handle the case where frequency list verse goal is met
      useOnlineStorage.setState((state) => ({
        dailyFrequencyListVerseCountStreak: state.dailyFrequencyListVerseCountStreak + 1,
      }));
    }
  }
});
