import { WordCount, WordData } from "../src/types";
import fs from "fs";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
};

const data: Data = require("./data.json");
const rootData: {
  [key: string]: {
    [key: string]: string[];
  };
} = {};
for (const s in data) {
  for (const v in data[s]) {
    for (const w in data[s][v]) {
      const word = data[s][v][w];
      for (const segIndex in word) {
        if (word[segIndex].root && word[segIndex].lemma) {
          rootData[word[segIndex].root] = rootData[word[segIndex].root] ?? {};

          rootData[word[segIndex].root][word[segIndex].lemma] =
            rootData[word[segIndex].root][word[segIndex].lemma] ?? [];

          rootData[word[segIndex].root][word[segIndex].lemma].push(word[segIndex].position);
        }
      }
    }
  }
}
const wordCount: WordCount = require("./wordCount.json");

const sortedData = Object.fromEntries(
  Object.entries(rootData).map(([root, wordGroups]) => {
    return [
      root,
      Object.fromEntries(
        Object.entries(wordGroups)
          .sort((wordGroupA, wordGroupB) => {
            return wordGroupB[1].length - wordGroupA[1].length;
          })
          .map(([lemma, wordGroup]) => {
            return [
              lemma,
              wordGroup.sort((wordA, wordB) => {
                const [surahA, verseA] = wordA.split(":");
                const [surahB, verseB] = wordB.split(":");
                return +wordCount[surahA][verseA] - +wordCount[surahB][verseB];
              }),
            ];
          }),
      ),
    ];
  }),
);

// write data
fs.writeFile("./quran-word-lists/rootData.json", JSON.stringify(sortedData), function (err) {
  if (err) throw err;
  console.log("./quran-word-lists/rootData.json");
});
// write data
fs.writeFile("./src/rootData.json", JSON.stringify(sortedData), function (err) {
  if (err) throw err;
  console.log("./src/rootData.json");
});
