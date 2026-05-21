import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useLocalStorage = create<{
  audioVerse: string | undefined;
  setAudioVerse: (isOpen: string | undefined) => void;

  chapters: number[];
  setChapters: (chapters: number[]) => void;
  addChapter: (chapter: number) => void;
  removeChapter: (chapter: number) => void;

  goal: number;
  maxLives: number;
  currentVerse: {
    score: number;
    verse_key: string;
  };
  vocabularyMode: boolean;
}>()(
  persist(
    (set) => ({
      audioVerse: undefined,
      setAudioVerse: (audioVerse: string | undefined) => set({ audioVerse }),

      chapters: Array.from({ length: 114 }, (_, i) => i + 1), // initial state
      setChapters: (chapters: number[]) => set({ chapters }),
      addChapter: (chapter: number) => {
        set((state) => ({
          chapters: [...state.chapters, chapter],
        }));
      },
      removeChapter: (chapter: number) => {
        set((state) => ({
          chapters: state.chapters.filter((i) => i !== chapter),
        }));
      },
      goal: 1000,
      maxLives: 3,
      currentVerse: {
        score: 0,
        verse_key: "1:1",
      },
      vocabularyMode: true,
    }),
    {
      name: "useLocalStorage", // name of the item in the storage (must be unique)
      version: 3,
    },
  ),
);
