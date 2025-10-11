// src/stores/counter-store.ts
import { persist, PersistStorage } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { fontNames } from "@/utils/fontNames";
import { createClient } from "@/utils/supabase/clients";
import { Database } from "@/database.types";
const defaultColours: { [key: string]: [string, string] } = {
  ADJ: ["#832CC2", "#B87EE2"],
  CIRC: ["#1604B9", "#9388FC"],
  COM: ["#1604B9", "#9388FC"],
  CONJ: ["#1604B9", "#9388FC"],
  REM: ["#1604B9", "#9388FC"],
  RSLT: ["#1604B9", "#9388FC"],
  COND: ["#e37010", "#E47821"],
  INL: ["#e37010", "#E47821"],
  LOC: ["#e37010", "#E47821"],
  PREV: ["#e37010", "#E47821"],
  T: ["#e37010", "#E47821"],
  OBJ2: ["#5c7085", "#8798AB"],
  DEM: ["#bf9f3e", "#bf9f3e"],
  DET: ["#575757", "#969696"],
  INTG: ["#fd5162", "#FD5E6E"],
  N: ["#548dd4", "#6498D8"],
  SUBJ: ["#548dd4", "#6498D8"],
  NEG: ["#F66B41", "#FF6161"],
  PRO: ["#f4400b", "#F66B41"],
  PN: ["#257e9c", "#2FA1C3"],
  P: ["#ad2323", "#E37878"],
  PRP: ["#817418", "#A8981F"],
  REL: ["#817418", "#A8981F"],
  SUB: ["#817418", "#A8981F"],
  V: ["#32bd2f", "#32bd2f"],
  VOC: ["#32bd2f", "#32bd2f"],
  OBJ: ["#5c7085", "#8798AB"],
  others: ["#a8017b", "#FE48CE"],
};
import superjson from "superjson";
import { Card } from "ts-fsrs";
import reportIssue from "@/utils/reportIssue";
import { pullFromTheServer, useUserDataOutOfSyncStore } from "@/components/UserDataOutOfSync";

const supabase = createClient<Database>();
const storage: PersistStorage<PreferenceStore> = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    return superjson.parse(str);
  },
  setItem: async (name, value) => {
    value.state.lastModified = new Date();

    // 1. Write to localStorage
    localStorage.setItem(name, superjson.stringify(value) as string);

    // 2. Write to Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    async function setUserPreference() {
      if (user) {
        const a = await supabase
          .from("user_preference")
          .upsert({ preference: superjson.stringify(value), user_id: user.id })
          .then();
        if (a.error)
          if (!navigator.onLine)
            if (confirm("Failed to save preference to server. Retry?")) await setUserPreference();
            else reportIssue();
      }
    }
    await setUserPreference();
  },
  removeItem: (name: string) => {
    console.log(name, "has been deleted");
  },
};
type reviewOrderType = "next_review ASC" | "next_review DESC" | "level ASC" | "level DESC" | "random";
type PreferenceStore = {
  translation_ids: string[];
  setTranslation_ids: (translation_ids: string[]) => void;
  showTranslation: boolean;
  setShowTranslation: (showTranslation: boolean) => void;

  showTranslationOnHiddenWords: boolean;
  setShowTranslationOnHiddenWords: (showTranslationOnHiddenWords: boolean) => void;

  showTransliteration: boolean;
  setShowTransliteration: (showTranslation: boolean) => void;
  colours: { [key: string]: [string, string] };
  setColours: (pos: string, value: string, value2: string) => void;
  font: (typeof fontNames)[number];
  resetColours: () => void;
  setFont: (font: (typeof fontNames)[number]) => void;
  intervals: {
    [key: number]: number;
  };
  setInterval: (percentage: number, interval: number) => void;
  removeInterval: (percentage: number) => void;
  setAllIntervals: (intervals: { [key: number]: number }) => void;
  reviewOrder: reviewOrderType;
  setReviewOrder: (reviewOrder: reviewOrderType) => void;
  reciter_id: string;
  setReciter_id: (reciter_id: string) => void;

  ARScore: number; // initial state
  setARScore: (score: number) => void;
  addARScore: (score: number) => void;

  ARProgress: {
    [key: number]: number;
  };
  setARProgress: (chapter: number, progress: number) => void;
  addARProgress: (chapter: number, progress: number) => void;
  resetARProgress: () => void;
  lastModified: Date;

  wordList: {
    [key: string]: { card: Card; index: string; isSuspended: boolean };
  };
  addToWordList: (key: string, word: { card: Card; index: string; isSuspended?: boolean }) => void;
  updateCard: (key: string, card: Card) => void;
  toggleSuspend: (key: string) => void;
  removeFromWordList: (key: string) => void;
  resetWordList: () => void;
  maximumInterval: number;
  setMaximumInterval: (maximumInterval: number) => void;
};
export const useOnlineStorage = createWithEqualityFn<PreferenceStore>()(
  persist(
    (set) => {
      return {
        translation_ids: ["20"],
        setTranslation_ids: (translation_ids: string[]) => set({ translation_ids }),
        showTranslation: false,
        setShowTranslation: (showTranslation: boolean) => set({ showTranslation }),
        showTranslationOnHiddenWords: false,
        setShowTranslationOnHiddenWords: (showTranslationOnHiddenWords: boolean) =>
          set({ showTranslationOnHiddenWords }),
        showTransliteration: false,
        setShowTransliteration: (showTransliteration: boolean) => set({ showTransliteration }),
        colours: defaultColours,
        setColours: (pos, value, value2) => {
          set((state) => {
            return { colours: { ...state.colours, [pos]: [value, value2] } };
          });
        },
        resetColours: () => set(() => ({ ...{ colours: defaultColours } })),
        font: "Noto_Sans_Arabic",
        setFont: (font: (typeof fontNames)[number]) => set({ font }),
        intervals: {
          25: 86400000,
          50: 864000000,
          75: 2592000000,
          100: 15552000000,
        },
        setInterval: (percentage, interval) =>
          set((state) => ({
            intervals: {
              ...state.intervals,
              [percentage]: interval,
            },
          })),
        removeInterval: (percentage) => {
          set((prev) => {
            const newIntervals = { ...prev.intervals };
            delete newIntervals[percentage];
            return { intervals: newIntervals };
          });
        },
        setAllIntervals: (intervals: { [key: number]: number }) =>
          set(() => ({
            intervals,
          })),
        ARScore: 0, // initial state
        setARScore: (ARScore: number) => set({ ARScore }),
        addARScore: (ARScore: number) => {
          set((state) => ({
            ARScore: state.ARScore + ARScore,
          }));
        },
        reviewOrder: "next_review ASC",
        setReviewOrder: (reviewOrder: reviewOrderType) => set({ reviewOrder }),
        reciter_id: 7 + "",
        setReciter_id: (reciter_id) => set({ reciter_id }),

        ARProgress: Object.fromEntries(Array.from({ length: 114 }, (_, i) => i + 1).map((chapter) => [chapter, 0])),
        setARProgress: (chapter: number, progress: number) => {
          set((state) => {
            state.ARProgress[chapter] = progress;
            return {
              ARProgress: Object.assign({}, state.ARProgress),
            };
          });
        },
        addARProgress: (chapter: number, progress: number) => {
          set((state) => {
            state.ARProgress[chapter] += progress;
            return {
              ARProgress: Object.assign({}, state.ARProgress),
            };
          });
        },
        resetARProgress: () =>
          set({
            ARProgress: Object.fromEntries(Array.from({ length: 114 }, (_, i) => i + 1).map((chapter) => [chapter, 0])),
          }),
        lastModified: new Date(),

        wordList: {},
        addToWordList: (key: string, word: { card: Card; index: string; isSuspended?: boolean }) => {
          set((state) => {
            state.wordList[key] = {
              isSuspended: false,
              ...word,
            };
            return {
              wordList: { ...state.wordList },
            };
          });
        },
        updateCard: (key: string, card: Card) => {
          set((state) => {
            const wordList = superjson.parse<typeof state.wordList>(superjson.stringify(state.wordList)); // deep copy
            if (wordList[key]) {
              wordList[key].card = card;
            }
            return {
              wordList: wordList,
            };
          });
        },
        toggleSuspend: (key: string) => {
          set((state) => {
            state.wordList[key].isSuspended = !state.wordList[key].isSuspended;
            return {
              wordList: { ...state.wordList },
            };
          });
        },
        removeFromWordList: (key: string) => {
          set((state) => {
            delete state.wordList[key];
            return {
              wordList: { ...state.wordList },
            };
          });
        },
        resetWordList: () => {
          set(() => ({
            wordList: {},
          }));
        },
        maximumInterval: 365,
        setMaximumInterval: (maximumInterval: number) => set({ maximumInterval }),
      };
    },
    {
      version: 8,
      name: "preference-storage",
      storage: storage,
      skipHydration: true,
    }
  )
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
});
