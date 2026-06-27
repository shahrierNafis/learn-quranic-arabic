import { WordData } from "../../src/types";
import { buckwalterToArabic as b2a, arabicToBuckwalter as a2b } from "@/utils/arabic-buckwalter-transliteration";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
};
const data: Data = require("./../data.json");
export type FillPgn = "1S" | "1P" | "2nd person" | "3FS" | "3rd person";
export default async function getFillPgnOptions(prefix: FillPgn, position: string, segIndex: number) {
  const [s, v, w] = position.split(":");
  const segments: WordData = data[+s][+v][+w];
  const options: WordData[] = [];
  let prefixes: string[] = [];
  switch (prefix) {
    case "1S":
      prefixes = ["n", "t", "y"];
      break;
    case "1P":
      prefixes = [">", "t", "y"];

      break;
    case "2nd person":
      prefixes = [">", "n", "y"];

      break;
    case "3FS":
      prefixes = [">", "n", "y"];

      break;
    case "3rd person":
      prefixes = [">", "n", "t"];

      break;
  }
  prefixes.forEach((p) => {
    const newSegments: WordData = JSON.parse(JSON.stringify(segments));
    newSegments[segIndex].buckwalter = p + a2b(newSegments[segIndex].buckwalter.slice(1));

    if (newSegments.length != segments.length) {
      throw new Error();
    }
    options.push(newSegments);
  });
  return options;
}
