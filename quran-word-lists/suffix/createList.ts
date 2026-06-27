import fs from "fs";
import { List, WordData, Requirements, WordSegment } from "../../src/types";
import path from "path";
import { descriptions } from "./descriptions";
import getOptions from "../lib/getOptions";
import { HarfRequirement } from "../lib/requirements";
import sortList from "../lib/sortList";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
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
      if (word.some((segment) => segment.aspect == "IMPV" || segment.aspect == "IMPF")) {
        continue;
      }
      for (const segIndex in word) {
        if (word[segIndex].arPartOfSpeech == "suffix") {
          // group by word[segIndex].affix prefix
          const SuffixGroupName = getSuffixGroupName(word, +segIndex);
          const suffixGroup = list[SuffixGroupName] ?? {
            positions: [] as string[],
            words: [],
            spellings: new Set(),
          };
          const position = `${s}:${v}:${w}`;
          suffixGroup.positions.push(position);
          suffixGroup.words.push({
            position,
            segIndex: segIndex,
          });
          suffixGroup.spellings?.add(word[segIndex].buckwalter);
          suffixGroup.name = SuffixGroupName;
          suffixGroup.description =
            getDescription(word, +segIndex, Array.from(suffixGroup?.spellings ?? [])) ?? word[segIndex].affix;
          if (["OBJ", "SUBJ", "OBJ2"].includes(word[segIndex].partOfSpeech)) {
            suffixGroup.getOptions = propGetOptions;
          } else {
            suffixGroup.getOptions = propGetHarfOptions;
          }
          list[SuffixGroupName] = suffixGroup;
        }
      }
    }
  }
}
async function propGetOptions(position: string, segIndex: string, extraSegments?: WordSegment[]) {
  const requirements: Requirements = [
    {
      shouldMatch: ["partOfSpeech", "arPartOfSpeech"],
      shouldNotMatch: ["arabic"],
    },
  ];
  return await getOptions(position, segIndex, requirements, extraSegments);
}

async function propGetHarfOptions(position: string, segIndex: string, extraSegments?: WordSegment[]) {
  return await getOptions(position, segIndex, HarfRequirement, extraSegments);
}
const sortedList = sortList(list);

console.log(
  JSON.stringify(
    sortedList
      .map((sli) => {
        return { name: sli.name, spellings: Array.from(sli.spellings ?? []) };
      })
      .filter((sli) => sli.name.startsWith("SUBJ")),
  ),
);

for (const i in sortedList) {
  const [s, v, w] = sortedList[i].words[0]?.position.split(":");
  const word = data[+s][+v][+w];
  const extraSegments: WordSegment[] = Array.from(sortedList[i].spellings ?? []).map((buc) => {
    return {
      arabic: buckwalterToArabic(buc),
      buckwalter: buc,
      arPartOfSpeech: word[+sortedList[i].words[0]?.segIndex].arPartOfSpeech,
      partOfSpeech: word[+sortedList[i].words[0]?.segIndex].partOfSpeech,
      position: word[+sortedList[i].words[0]?.segIndex].position,
    };
  });

  options[cyrb64(sortedList[i].words.map((w) => w.position).join("")) + ""] = await sortedList[i].getOptions(
    sortedList[i].words[0]?.position,
    sortedList[i].words[0]?.segIndex + "",
    extraSegments,
  );

  console.log(i + "/" + sortedList.length);
}

// write lists
fs.writeFile(
  "./.seed-data/suffixList.json",

  JSON.stringify(sortedList),
  function (err) {
    if (err) throw err;
    console.log("./.seed-data/suffixList.json");
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
); // write options
fs.writeFile("./src/options.json", JSON.stringify(options), function (err) {
  if (err) throw err;
  console.log("./src/options.json");
});

function getDescription(word: WordData, segIndex: number, spellings: string[]) {
  let description = (word[segIndex].affix && descriptions[word[segIndex].affix]) ?? "";
  if (!word[segIndex].affix) {
    switch (word[segIndex].person) {
      case 1:
        description += "1st person";
        break;
      case 2:
        description += "2nd person";
        break;
      case 3:
        description += "3rd person";
        break;
    }

    switch (word[segIndex].number) {
      case "S":
        description += " singular";
        break;
      case "D":
        description += " dual";
        break;
      case "P":
        description += " plural";
        break;
    }

    switch (word[segIndex].gender) {
      case "M":
        description += " masculine";
        break;
      case "F":
        description += " feminine";
        break;
    }

    if (
      (word[segIndex].partOfSpeech == "OBJ" || word[segIndex].partOfSpeech == "OBJ2") &&
      !(word[segIndex].person == 1 && word[segIndex].number == "S")
    ) {
      description += " object/possessive";
    } else {
      switch (word[segIndex].partOfSpeech) {
        case "SUBJ":
          description += " subject";
          break;
        case "OBJ":
          description += " object";
          break;
        case "OBJ2":
          description += " possessive";
          break;
      }
    }
    description += ` pronoun`;

    if (word[segIndex].partOfSpeech == "SUBJ") {
      description +=
        " attached to a " +
        (word.some((seg) => seg.aspect === "PERF")
          ? "perfect"
          : word.some((seg) => seg.aspect === "IMPF")
            ? "imperfect"
            : "imperative") +
        " verb";
    }
  }
  return description;
}
function getSuffixGroupName(word: WordData, segIndex: number): string {
  let aspect, mood;

  for (const segment of word) {
    aspect = segment.aspect ?? aspect;
    mood = segment.mood ?? mood;
  }

  let value =
    word[segIndex].affix ?? word[segIndex].person + "" + (word[segIndex].gender ?? "") + word[segIndex].number;
  if (word[segIndex].partOfSpeech === "OBJ" || word[segIndex].partOfSpeech === "OBJ2") {
    if (!(word[segIndex].person == 1 && word[segIndex].number == "S")) {
      return "OBJ_POS-" + value;
    } else {
      return word[segIndex].partOfSpeech + "-" + value;
    }
  }
  if (word[segIndex].partOfSpeech === "SUBJ") {
    value = word[segIndex].partOfSpeech + "-" + value + "-" + aspect;
  }

  return value;
}
