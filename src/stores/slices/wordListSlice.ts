// src/stores/slices/wordListSlice.ts
import { StateCreator } from "zustand";
import superjson from "superjson";
import { Card } from "ts-fsrs";
import { PreferenceStore, WordListSlice } from "../types";

export const createWordListSlice: StateCreator<PreferenceStore, [], [], WordListSlice> = (set) => ({
  wordList: {},

  addToWordList: (key: string, word: { card: Card; index: string; isSuspended?: boolean }) => {
    set((state) => {
      state.wordList[key] = {
        isSuspended: false,
        ...word,
      };
      return { wordList: { ...state.wordList } };
    });
  },

  updateCard: (key: string, card: Card) => {
    set((state) => {
      const wordList = superjson.parse<typeof state.wordList>(superjson.stringify(state.wordList)); // deep copy
      if (wordList[key]) {
        wordList[key].card = card;
      }
      return { wordList };
    });
  },

  toggleSuspend: (key: string) => {
    set((state) => {
      state.wordList[key].isSuspended = !state.wordList[key].isSuspended;
      return { wordList: { ...state.wordList } };
    });
  },

  removeFromWordList: (key: string) => {
    set((state) => {
      delete state.wordList[key];
      return { wordList: { ...state.wordList } };
    });
  },

  resetWordList: () => {
    set(() => ({ wordList: {} }));
  },
});
