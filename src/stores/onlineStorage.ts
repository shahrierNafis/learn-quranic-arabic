// src/stores/counter-store.ts
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import superjson from "superjson";
import { pullFromTheServer, useUserDataOutOfSyncStore } from "@/components/UserDataOutOfSync";

import { GoalRecord, PreferenceStore } from "./types";
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
    immer((...a) => ({
      ...createDisplayPreferencesSlice(...a),
      ...createColoursSlice(...a),
      ...createReviewSlice(...a),
      ...createARSlice(...a),
      ...createWordListSlice(...a),
      ...createMiscSlice(...a),
      ...createDailyGoalsSlice(...a),
    })),
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
  if (diff > 0)
    useOnlineStorage.setState((state) => {
      state.date = dayjs().format("YYYY-MM-DD");
      for (const [key, value] of Object.entries(state.goalRecords)) {
        state.goalRecords[key].value = 0;
        state.goalRecords[key].streak = value.value > value.goal && diff === 1 ? value.streak + 1 : 0;
      }
    });
});
