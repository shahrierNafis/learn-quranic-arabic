import _ from "lodash";
import { CorpusApiWord } from "../src/types";
import fs from "fs";
const pronounData: {
  [key: string]: {
    [key: string]: {
      [key: string]: { [key: string]: "subj" | "obj" | "obj2" };
    };
  };
} = {};

const corpusAPIdata: {
  [key: string]: { [key: string]: { [key: string]: CorpusApiWord } };
} = require("./corpusAPIdata.json");
for (const surah in corpusAPIdata) {
  for (const ayah in corpusAPIdata[surah]) {
    for (const kalima in corpusAPIdata[surah][ayah]) {
      for (const segment in corpusAPIdata[surah][ayah][kalima].token.segments) {
        if (
          ["subj", "obj", "obj2"].includes(corpusAPIdata[surah][ayah][kalima].token.segments[segment].pronounType ?? "")
        ) {
          _.setWith(
            pronounData,
            [surah, ayah, kalima, segment],
            corpusAPIdata[surah][ayah][kalima].token.segments[segment].pronounType,
            Object,
          );
        }
      }
    }
  }
}
// write data
fs.writeFile("./quran-word-lists/pronounData.json", JSON.stringify(pronounData), function (err) {
  if (err) throw err;
  console.log("./quran-word-lists/pronounData.json");
});
