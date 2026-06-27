import fs from "fs";
import path from "path";
import { List, WordData, WordCount, Requirements, WordSegment } from "../../src/types";
import getOptions from "../lib/getOptions";
import { lemmaRequirements } from "../lib/requirements";
import sortList from "../lib/sortList";
import { buckwalterToArabic as bt } from "@/utils/arabic-buckwalter-transliteration";
import { cyrb64 } from "../lib/cyrb64";
let options: {
  [key: string]: WordData[];
};
try {
  options = require("../../src/options.json");
} catch (error) {
  options = {};
}

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
};

const data: Data = require("./../data.json");
const list: List = {};
for (const s in data) {
  for (const v in data[s]) {
    for (const w in data[s][v]) {
      const word = data[s][v][w];
      for (const segIndex in word) {
        if (!["ism", "fiʿil"].includes(word[segIndex].arPartOfSpeech) || !word[segIndex].lemma) {
          continue;
        }
        const lemmaGroup = list[word[segIndex].lemma] ?? {
          words: [],
          positions: [],
        };

        // add word to the groups
        const position = `${s}:${v}:${w}`;
        lemmaGroup.positions.push(position);
        lemmaGroup.words.push({
          position,
          segIndex: segIndex,
        });
        lemmaGroup.getOptions = propGetOptions;
        lemmaGroup.name = "";
        lemmaGroup.description = bt(word[segIndex].lemma);
        list[word[segIndex].lemma] = lemmaGroup;
      }
    }
  }
}
async function propGetOptions(position: string, segIndex: string, extraSegments?: WordSegment[]) {
  return await getOptions(position, segIndex, lemmaRequirements, extraSegments);
}
const sortedList = sortList(list);

for (const i in sortedList) {
  options[cyrb64(sortedList[i].words.map((w) => w.position).join("")) + ""] = await sortedList[i].getOptions(
    sortedList[i].words[0]?.position,
    sortedList[i].words[0]?.segIndex + "",
  );
  console.log(i + "/" + sortedList.length);
}

// write lists
fs.writeFile("./.seed-data/ism&fi'lList.json", JSON.stringify(sortedList), function (err) {
  if (err) throw err;
  console.log("./.seed-data/ism&fi'lList.json");
});
// write listCount
fs.writeFile(
  path.join(__dirname, "listCount.json"),
  JSON.stringify(
    sortedList.map((arr) => {
      return arr.positions.length;
    }),
  ),
  function (err) {
    if (err) throw err;
    console.log(__dirname + "listCount.json");
  },
);
// write options
fs.writeFile("./src/options.json", JSON.stringify(options), function (err) {
  if (err) throw err;
  console.log("./src/options.json");
});
