import { List, WordCount } from "@/types";
const wordCount: WordCount = require("../wordCount.json");

export default function sortList(list: List) {
  return Object.values(list)
    .map((wordGroup) => {
      wordGroup.words = wordGroup.words.sort((wordA, wordB) => {
        const [surahA, verseA, indexA] = wordA.position.split(":");
        const [surahB, verseB, indexB] = wordB.position.split(":");
        let wc = +wordCount[surahA][verseA] - +wordCount[surahB][verseB];
        let s = +surahA - +surahB;
        let v = +verseA - +verseB;
        let w = +indexA - +indexB;
        return wc ?? s ?? v ?? w;
      });
      wordGroup.positions = wordGroup.words.map((w) => w.position);
      return wordGroup;
    })
    .sort((wordGroupA, wordGroupB) => {
      return wordGroupB.words.length - wordGroupA.words.length;
    });
}
