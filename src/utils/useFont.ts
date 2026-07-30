import React from "react";
import { Noto_Sans_Arabic, Noto_Kufi_Arabic, Noto_Naskh_Arabic, Amiri_Quran } from "next/font/google";
import { create } from "zustand/react";
import { NextFont } from "next/dist/compiled/@next/font";
import { useShallow } from "zustand/shallow";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fontNames } from "./fontNames";
const sans = Noto_Sans_Arabic({
  weight: "400",
  subsets: ["arabic"],
});
const kufi = Noto_Kufi_Arabic({
  weight: "400",
  subsets: ["arabic"],
});
const naskh = Noto_Naskh_Arabic({
  weight: "400",
  subsets: ["arabic"],
});

const amiri_quran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
});
const googleFonts = {
  Noto_Sans_Arabic: sans,
  Noto_Kufi_Arabic: kufi,
  Noto_Naskh_Arabic: naskh,
  Amiri_Quran: amiri_quran,
};

const useStore = create<{
  font: NextFont | null;
  setFont: (font: NextFont) => void;
}>((set) => ({
  font: null,
  setFont: (font: NextFont) => set({ font }),
}));

export default function useFont(): [NextFont | null, string, typeof googleFonts] {
  const { font: fontName } = useQuery(api.displayPreferences.get) ?? { font: "Noto_Sans_Arabic" };
  const { font, setFont } = useStore(useShallow((a) => a));
  setFont(googleFonts[fontName as (typeof fontNames)[number]]);

  return [font, fontName, googleFonts];
}
