"use server";
import { WordData } from "@/types";
import { cache } from "react";

type SegmentData = {
  [key: number]: {
    [key: number]: {
      [key: number]: WordData;
    };
  };
};
const data: SegmentData = require("./../data.json");

const getWordData = cache(async function (surah: number, verse: number, word: number) {
  return data[surah][verse][word];
});
export default getWordData;
