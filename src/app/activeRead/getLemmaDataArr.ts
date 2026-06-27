"use server";

import { LemmaData } from "@/types";

export default async function getLemmaDataArr(): Promise<LemmaData[]> {
  return require("@/lemmaData.json") as LemmaData[];
}
