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

const sortedData: RootData = Object.fromEntries(
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
// write data
fs.writeFile(
  "./quran-word-lists/rootGroupsByFirstLetter.json",
  JSON.stringify(groupRootsByFirstLetter(sortedData)),
  function (err) {
    if (err) throw err;
    console.log("./quran-word-lists/rootGroupsByFirstLetter.json");
  },
);
// write data
fs.writeFile("./src/rootGroupsByFirstLetter.json", JSON.stringify(groupRootsByFirstLetter(sortedData)), function (err) {
  if (err) throw err;
  console.log("./src/rootGroupsByFirstLetter.json");
});
function groupRootsByFirstLetter(data: RootData): RootGroupByFirstLetter {
  const groups: RootGroupByFirstLetter = {};

  for (const [root, lemmaMap] of Object.entries(data)) {
    const letter = root.charAt(0); // case-sensitive, no lowercasing

    // build lemma entries, sorted by their own index count (descending)
    const lemmas: LemmaEntry[] = Object.entries(lemmaMap)
      .map(([lemma, indices]) => ({ lemma, indices }))
      .sort((a, b) => b.indices.length - a.indices.length);

    const totalIndexCount = lemmas.reduce((sum, l) => sum + l.indices.length, 0);

    const entry: RootEntry = { root, lemmas, totalIndexCount };

    if (Array.isArray(groups[letter]) === false) groups[letter] = [];
    groups[letter].push(entry);
  }

  // sort roots within each letter group by total index count, descending
  for (const roots of Object.values(groups)) {
    roots.sort((a, b) => b.totalIndexCount - a.totalIndexCount);
  }

  return groups;
}
type RootData = {
  [root: string]: {
    [lemma: string]: string[];
  };
};

type LemmaEntry = {
  lemma: string;
  indices: string[];
};

type RootEntry = {
  root: string;
  lemmas: LemmaEntry[];
  totalIndexCount: number;
};

export type RootGroupByFirstLetter = {
  [letter: string]: RootEntry[];
};
