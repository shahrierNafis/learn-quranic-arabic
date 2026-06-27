import fs from "fs";
import { List, WordData, WordCount, Requirements, WordSegment, PartOfSpeech } from "../../src/types";
import path from "path";
import { descriptions } from "./descriptions";
import getOptions from "../lib/getOptions";
import { HarfRequirement } from "../lib/requirements";
import sortList from "../lib/sortList";
import { arabicToBuckwalter, buckwalterToArabic as bt } from "@/utils/arabic-buckwalter-transliteration";
import _ from "lodash";
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
        if (word[segIndex].arPartOfSpeech == "ḥarf") {
          const groupName = word[segIndex].partOfSpeech! + word[segIndex].lemma;
          const group = list[groupName] ?? {
            words: [],
            positions: [],
          };

          // add word to the groups
          const position = `${s}:${v}:${w}`;
          group.words.push({
            position,
            segIndex: segIndex,
          });
          group.getOptions = propGetHarfOptions;
          group.name = bt(word[segIndex].lemma) + " " + word[segIndex].partOfSpeech;
          group.description = bt(word[segIndex].lemma) + ": " + descriptions[word[segIndex].partOfSpeech ?? ""];
          list[groupName] = group;
        }
      }
    }
  }
}
async function propGetHarfOptions(position: string, segIndex: string, extraSegments?: WordSegment[]) {
  return await getOptions(position, segIndex, HarfRequirement, extraSegments);
}
const spellingsArr: { [key in PartOfSpeech]?: string[] } = {
  P: [
    "عَلَيْ",
    "فِي",
    "مِ",
    "إِلَيْ",
    "مِن",
    "عَلَىء",
    "مِّن",
    "عَلَىءٓ",
    "مِنَ",
    "فِى",
    "إِلَىء",
    "مِّنَ",
    "فِىٓ",
    "مِّ",
    "مِنْ",
    "مِنۢ",
    "إِلَى",
    "عَلَى",
    "عَنْ",
    "مِّنِّ",
    "مَعَ",
    "عَن",
    "مِّنْ",
    "مِّنۢ",
    "حَتَّىء",
    "عَ",
    "إِلَىءٓ",
    "مِنَّ",
    "عَنِّ",
    "عَنِ",
    "مِنِّ",
    "عَنَّ",
    "إِلَىَّ",
    "عَلَىَّ",
    "عَنۢ",
    "مِّنَّ",
    "فِّى",
    "حَتَّىءٓ",
    "عَّلَيْ",
  ],
  NEG: [
    "لَا",
    "لَمْ",
    "مَا",
    "لَّا",
    "لَّمْ",
    "لَن",
    "إِنْ",
    "مَّا",
    "مَآ",
    "لَّآ",
    "لَآ",
    "لَمَّا",
    "لَّن",
    "إِن",
    "ئَلَّا",
    "إِنِ",
    "مَّآ",
    "لَنْ",
    "كَيْلَا",
    "لَّمَّا",
  ],
  INL: [
    "الٓمٓ",
    "الٓمٓصٓ",
    "الٓر",
    "الٓمٓر",
    "كٓهيعٓصٓ",
    "طه",
    "طسٓمٓ",
    "طسٓ",
    "يسٓ",
    "صٓ",
    "حمٓ",
    "عٓسٓقٓ",
    "قٓ",
    "نٓ",
  ],
  ACC: [
    "إِنَّ",
    "لَعَلَّ",
    "أَنَّ",
    "إِنِّ",
    "أَنِّ",
    "كَأَنَّ",
    "لَءكِنَّ",
    "لَيْتَ",
    "ئِنَّ",
    "لَّعَلَّ",
    "لَءكِنِّ",
    "لَّعَلِّ",
    "ءِنَّ",
    "أَنَّمَآ",
    "لَّءكِنَّ",
    "أَ",
    "لَعَلِّ",
    "وَيْكَأَنَّ",
  ],
  CONJ: ["أَمْ", "أَوْ", "ثُمَّ", "أَمِ", "أَوِ", "أَم", "أَ", "أَمَّا", "أَمَّاذَا", "أَو", "بَلْ"],
  RES: ["إِلَّآ", "إِلَّا"],
  PRO: ["لَا", "لَّا"],
  PREV: ["مَا", "مَآ", "مَّا"],
  INC: ["أَلَآ", "حَتَّىءٓ", "بَلْ", "بَلِ", "أَلَا", "حَتَّىء"],
  AMD: ["لَءكِن", "لَءكِنِ", "لَءكِنْ", "لَّءكِنِ", "لَءكِنۢ"],
  SUB: ["مَآ", "أَن", "أَنْ", "مَا", "لَوْ", "ئَ", "أَ", "كَيْلَا", "مَّا", "أَنِ", "كَىْ"],
  COND: [
    "لَوْ",
    "إِن",
    "ٱلَّذِينَ",
    "إِمَّا",
    "مَن",
    "مَنْ",
    "لَوْلَا",
    "مَنِ",
    "لَّوْ",
    "مَا",
    "أَيْنَمَا",
    "ئِنِ",
    "إِنْ",
    "حَيْثُ",
    "ئِنْ",
    "أَيْنَ",
    "مَنۢ",
    "إِنِ",
    "مَآ",
    "لَوِ",
    "إِي۟ن",
    "ئِن",
    "ٱلَّءتِى",
    "مَّآ",
    "مَّن",
    "ئِنۢ",
    "إِ",
    "لَوْلَآ",
    "مَهْمَا",
    "إِذَا",
    "لَّوْلَا",
    "إِلَّمْ",
    "أَمَّآ",
    "أَمَّا",
    "أَيَّ",
    "إِنۢ",
    "لَّوْلَآ",
    "لَّوِ",
  ],
  SUP: ["مَّا", "مَا"],
  EXL: ["أَمَّا", "إِمَّآ", "إِمَّا", "أَمَّآ"],
  INTG: [
    "مَاذَآ",
    "كَيْفَ",
    "مَا",
    "مَ",
    "مَنْ",
    "مَن",
    "هَلْ",
    "كَمْ",
    "مَتَىء",
    "مَاذَا",
    "أَنَّىء",
    "مَّن",
    "كَم",
    "أَيُّ",
    "هَل",
    "مَّا",
    "أَىُّ",
    "أَيْنَ",
    "مَّنْ",
    "أَيَّانَ",
    "مَّاذَا",
    "مَّاذَآ",
    "مَالِ",
    "مَآ",
    "أَىَّ",
    "هَلِ",
    "أَىِّ",
    "أَييِّ",
    "مَّ",
  ],
  EXP: ["إِلَّا", "إِلَّآ", "لَمَّا", "لَّمَّا"],
  CERT: ["قَدْ", "قَدِ", "إِن", "قَد", "إِلَّآ", "إِنْ", "إِلَّا"],
  ANS: ["بَلَىء", "إِذًا", "بَلَىءٓ", "نَعَمْ", "إِى"],
  RET: ["بَل", "بَلْ", "بَلِ"],
  EXH: ["لَوْلَا", "لَوْلَآ", "لَّوْلَا", "لَّوْلَآ"],
  INT: ["أَن", "أَنْ", "أَنِ", "أَ", "أَنۢ"],
  FUT: ["سَوْفَ"],
  SUR: ["إِذَا", "إِذًا", "إِذَآ"],
  AVR: ["كَلَّا", "كَلَّآ"],
} as const;
const sortedList = sortList(list);
for (const i in sortedList) {
  const [s, v, w] = sortedList[i].words[0].position.split(":");
  const wordData = data[+s][+v][+w];
  const { arabic, partOfSpeech, arPartOfSpeech, position } = wordData[+sortedList[i].words[0]?.segIndex];

  const extraSegments: WordSegment[] = // all the spellings of the its partOfSpeech
    Object.values(spellingsArr)
      .filter((spellings) => spellings.includes(arabic))
      .flat(1)
      ?.map((spelling) => ({
        buckwalter: arabicToBuckwalter(spelling),
        arabic: spelling,
        arPartOfSpeech,
        partOfSpeech,
        position,
      })) ?? [];

  options[cyrb64(sortedList[i].words.map((w) => w.position).join("")) + ""] = await sortedList[i].getOptions(
    sortedList[i].words[0]?.position,
    sortedList[i].words[0]?.segIndex + "",
    extraSegments,
  );

  console.log(i + "/" + sortedList.length);
}
// write lists
fs.writeFile(
  "./.seed-data/harfList.json",

  JSON.stringify(sortedList),
  function (err) {
    if (err) throw err;
    console.log("./.seed-data/harfList.json");
  },
);
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
