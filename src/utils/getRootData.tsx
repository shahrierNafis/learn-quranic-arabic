"use server";
import { WordData } from "@/types";
import { cache } from "react";
import { RootData } from "@/quran-data/createRootData";

const rootData: RootData = require("@/quran-data/rootData.json");

const getRootData = cache(async function (root: string): Promise<RootData[number]> {
  return rootData[root];
});
export default getRootData;
