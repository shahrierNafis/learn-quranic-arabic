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

const rootData: {
  [key: string]: {
    [key: string]: string[];
  };
} = require("./../rootData.json");

const getRootData = cache(async function (root: string) {
  return rootData[root];
});
export default getRootData;
