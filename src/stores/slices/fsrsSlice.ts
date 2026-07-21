// src/stores/slices/miscSlice.ts
import { StateCreator } from "zustand";
import { FSRSSlice, PreferenceStore } from "../types";
import { createEmptyCard } from "ts-fsrs";

export const createFSRSSlice: StateCreator<PreferenceStore, [], [], FSRSSlice> = () => ({
  rootGroupsByFirstLetter: Object.fromEntries(arabicAlphabet.map((letter) => [letter, createEmptyCard()])),
});
const arabicAlphabet = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
];
