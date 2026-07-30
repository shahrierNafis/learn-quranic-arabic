"use server";
import { LemmaData } from "@/types";
import { cache } from "react";

const lemmaData: LemmaData[] = require("@/quran-data/lemmaData.json");

const getLemmaData = cache(async function (lemma: string) {
  return lemmaData.find((entry) => entry.lemma === lemma);
});

export default getLemmaData;
