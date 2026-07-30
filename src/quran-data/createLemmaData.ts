import { LemmaData, WordCount, WordData } from "@/types";
import fs from "fs";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
};

const data: Data = require("./data.json");

const lemmaData: LemmaData[] = [];
for (const s in data) {
  for (const v in data[s]) {
    for (const w in data[s][v]) {
      const word = data[s][v][w];
      for (const segIndex in word) {
        const lemma = word[segIndex].lemma;
        if (lemma) {
          if (!lemmaData.some((entry) => entry.lemma === lemma)) {
            lemmaData.push({
              lemma,
              positions: [],
              count: 0,
              rank: 0,
            });
          }
          const entry = lemmaData.find((e) => e.lemma === lemma);
          if (entry) {
            entry.positions.push(word[segIndex].position);
          }
        }
      }
    }
  }
}
const wordCount: WordCount = require("./wordCount.json");

const sortedLemmaData: LemmaData[] = lemmaData
  .map((entry) => ({
    lemma: entry.lemma,
    positions: entry.positions,
    count: entry.positions.length,
  }))
  .sort((entryA, entryB) => entryB.count - entryA.count)
  .map((entry, i) => {
    const seenVerses = new Set();
    return {
      lemma: entry.lemma,
      positions: entry.positions // 1. Filter out duplicate surah:verse combinations
        .filter((position) => {
          const [surah, verse] = position.split(":");
          const verseKey = `${surah}:${verse}`;

          if (seenVerses.has(verseKey)) {
            return false; // Duplicate found, skip it
          }

          seenVerses.add(verseKey);
          return true; // First time seeing this verse, keep it
        }) //2. Sort by whoever has a word count closer to 10
        .sort((wordA, wordB) => {
          const [surahA, verseA] = wordA.split(":");
          const [surahB, verseB] = wordB.split(":");

          const countA = +wordCount[surahA][verseA];
          const countB = +wordCount[surahB][verseB];

          return Math.abs(countA - 10) - Math.abs(countB - 10);
        }),
      count: entry.count,
      rank: i + 1,
    };
  });

// write data
fs.writeFile("./src/quran-data/lemmaData.json", JSON.stringify(sortedLemmaData), function (err) {
  if (err) throw err;
  console.log("./src/quran-data/lemmaData.json");
});
