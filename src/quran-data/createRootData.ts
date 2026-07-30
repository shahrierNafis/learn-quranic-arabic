import { QuranLaneLexicon } from "@/types/QuranLaneLexicon";
import { WordCount, WordData } from "@/types";
import fs from "fs";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
};

const data: Data = require("./data.json");
const rootsLaneLexicon: QuranLaneLexicon = require("./quran_arabic_roots_lane_lexicon_2026-02-12.json");
const rootData: RootData = {};
for (const s in data) {
  for (const v in data[s]) {
    for (const w in data[s][v]) {
      const word = data[s][v][w];
      for (const segIndex in word) {
        if (word[segIndex].root && word[segIndex].lemma) {
          rootData[word[segIndex].root] = rootData[word[segIndex].root] ?? {};

          rootData[word[segIndex].root].lemmas = rootData[word[segIndex].root].lemmas ?? {};

          rootData[word[segIndex].root].lemmas[word[segIndex].lemma] =
            rootData[word[segIndex].root].lemmas[word[segIndex].lemma] ?? [];

          rootData[word[segIndex].root].summary_en =
            rootData[word[segIndex].root].summary_en ??
            rootsLaneLexicon.roots.filter((r) => r.root_buckwalter === word[segIndex].root).pop()?.summary_en;
          rootData[word[segIndex].root].lemmas[word[segIndex].lemma].push(word[segIndex].position);
        }
      }
    }
  }
}
const wordCount: WordCount = require("./wordCount.json");

const sortedData: RootData = Object.fromEntries(
  Object.entries(rootData).map(([root, value]) => {
    return [
      root,
      {
        summary_en: value.summary_en,
        lemmas: Object.fromEntries(
          Object.entries(value.lemmas)
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
      },
    ];
  }),
);

// write data
fs.writeFile("./src/quran-data/rootData.json", JSON.stringify(sortedData), function (err) {
  if (err) throw err;
  console.log("./src/quran-data/rootData.json");
});

// write data
fs.writeFile(
  "./src/quran-data/rootGroupsByFirstLetter.json",
  JSON.stringify(groupRootsByFirstLetter(sortedData)),
  function (err) {
    if (err) throw err;
    console.log("./src/quran-data/rootGroupsByFirstLetter.json");
  },
);

function groupRootsByFirstLetter(data: RootData): RootGroupByFirstLetter {
  const groups: RootGroupByFirstLetter = {};

  for (const [root, value] of Object.entries(data)) {
    const letter = root.charAt(0); // case-sensitive, no lowercasing

    // build lemma entries, sorted by their own index count (descending)
    const lemmas: LemmaEntry[] = Object.entries(value.lemmas)
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
export type RootData = {
  [root: string]: {
    summary_en?: string;
    lemmas: { [lemma: string]: string[] };
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
