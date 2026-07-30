"use server";

import { LemmaData } from "@/types";

export default async function getLemmaDataArr(): Promise<LemmaData[]> {
  return require("@/quran-data/lemmaData.json") as LemmaData[];
}
