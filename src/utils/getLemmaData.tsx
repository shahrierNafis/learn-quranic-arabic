"use server";
import { LemmaData } from "@/types/types";
import { cache } from "react";

const lemmaData: LemmaData[] = require("@/lemmaData.json");

const getLemmaData = cache(async function (lemma: string) {
  return lemmaData.find((entry) => entry.lemma === lemma);
});

export default getLemmaData;
