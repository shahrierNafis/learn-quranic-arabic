import fs from "fs";
import _ from "lodash";
import { Affixes, CorpusApiWord, PartOfSpeech, WordData } from "../src/types";
import { PrefixPOS, prefixPOS } from "./preffixPOS";

import { buckwalterToArabic } from "../src/utils/arabic-buckwalter-transliteration";
let index = 0;
let prevPosition: string;
const data: {
  [key: string]: {
    [key: string]: {
      [key: string]: WordData;
    };
  };
} = {};
const pronounData: {
  [key: string]: {
    [key: string]: {
      [key: string]: { [key: string]: "subj" | "obj" | "obj2" };
    };
  };
} = require("./pronounData.json");
// const translation = fs
//   .readFileSync("./word-by-word.txt")
//   .toString()
//   .split("\n");
fs.readFileSync("./quran-word-lists/morphology.txt")
  .toString()
  .split("\n")
  .forEach((line, lineIndex, lineArray) => {
    if (line.trim() == "") return;

    const lineSegments = line.split("	");
    const position = lineSegments[0].substring(1, lineSegments[0].length - 3);
    const segmentIndex = lineSegments[0].split(":")[lineSegments[0].split(":").length - 1].slice(0, -1);
    if (prevPosition && position !== prevPosition) {
      index++;
    }

    // get word
    const word: WordData = _.get(data, position.split(":"), []) ?? [];

    // set word translation
    // word.translation = translation[index];
    let arPartOfSpeech: "fiʿil" | "ism" | "ḥarf" | "prefix" | "suffix" = "fiʿil";
    const buckwalter = getBuckWalter(line);
    const arabic = buckwalterToArabic(buckwalter);
    const aspect = getAspect(line);
    const mood = getMood(line) as "IND" | "SUBJ" | "JUS" | undefined;
    const voice = getVoice(line);
    const form = getForm(line);
    let PGN = getPGN(line);
    const derivation = getDerivation(line);
    const state = getState(line);
    const grammaticalCase = getGrammaticalCase(line);
    const root = getRoot(line);
    const lemma = getLemma(line);
    let partOfSpeech: PartOfSpeech = getPos(line) ?? "ACC";
    let person, gender, number;
    prevPosition = position;
    let affix: Affixes | undefined = undefined;
    if (isPrefix(line)) {
      // set prefix
      arPartOfSpeech = "prefix";
      affix = getPrefix(line)! as Affixes;
      (Object.keys(prefixPOS) as PrefixPOS[]).forEach((p) => {
        if (prefixPOS[p].includes(affix!)) {
          partOfSpeech = p;
        }
      });
    } else if (isSuffix(line)) {
      // set suffix
      arPartOfSpeech = "suffix";
      for (const segment of line.split(/[	 |]/)) {
        if (segment.includes("+")) {
          affix = segment as Affixes;
        } else if (segment.startsWith("PRON:")) {
          PGN = segment.substring(5);
          const [s, v, w] = position.split(":");
          if (["obj2", "obj"].includes(pronounData[s][v][w][+segmentIndex - 1])) {
            if (Object.values(data[s][v]).some((wd) => wd.some((s) => s.arPartOfSpeech == "fiʿil"))) {
              partOfSpeech = "OBJ";
            } else {
              partOfSpeech = "OBJ2";
            }
          } else {
            partOfSpeech = "SUBJ";
          }
        }
      }

      //
    }
    // is STEM
    else {
      if (isFiil(line)) {
        arPartOfSpeech = "fiʿil";
      } else if (isIsm(line)) {
        arPartOfSpeech = "ism";
      } else {
        arPartOfSpeech = "ḥarf";
      }
    }
    if (partOfSpeech == "V") {
      line.split("|").forEach((lineSeg) => {
        if (["1", "2", "3"].includes(lineSeg[0])) {
          PGN = lineSeg;
        }
      });
    }
    if (["V", "SUBJ", "OBJ", "OBJ2"].includes(partOfSpeech)) {
      if (PGN?.length === 3) {
        person = +PGN[0] as 1 | 2 | 3;
        gender = PGN[1] as "M" | "F";
        number = PGN[2] as "S" | "D" | "P";
      } else if (PGN) {
        person = +PGN[0] as 1 | 2 | 3;
        number = PGN[1] as "S" | "D" | "P";
      }
    }
    word.push({
      arabic,
      buckwalter,
      arPartOfSpeech,
      affix,
      person,
      gender,
      number,
      partOfSpeech,
      position,
      aspect,
      derivation,
      form,
      grammaticalCase,
      lemma,
      mood,
      root,
      state,
      voice,
    });
    _.setWith(data, position.split(":"), word, Object);
  });
// write data
fs.writeFile("./quran-word-lists/data.json", JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log("./quran-word-lists/data.json");
});
// write data
fs.writeFile("./src/data.json", JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log("./src/data.json");
});
// helper functions
function isPrefix(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("PREFIX")) {
      return true;
    }
  }
  return false;
}

function isSuffix(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("SUFFIX")) {
      return true;
    }
  }
  return false;
}
function isIsm(line: string) {
  for (const key of ["N", "PN", "ADJ", "IMPN", "PRON", "DEM", "REL", "T", "LOC"]) {
    if (line.split("	").includes(key)) {
      return true;
    }
  }
  return false;
}
function isFiil(line: string) {
  if (line.split("	").includes("V")) {
    return true;
  }
  return false;
}

function getRoot(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("ROOT")) {
          return seg.substring(5);
        }
      }
    }
  }
}
function getLemma(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("LEM")) {
          return seg.substring(4);
        }
      }
    }
  }
}

function getPos(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("POS")) {
          return seg.substring(4) as PartOfSpeech;
        }
      }
    }
  }
}
function getPrefix(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("+")) {
      return segment;
    }
  }
  return null;
}

function getAspect(line: string): "PERF" | "IMPF" | "IMPV" | undefined {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("PERF")) {
      return "PERF";
    }
    if (segment.includes("IMPF")) {
      return "IMPF";
    }
    if (segment.includes("IMPV")) {
      return "IMPV";
    }
  }
}

function getMood(line: string) {
  if (isFiil(line)) {
    if (getAspect(line) == "IMPF") {
      if (line.includes("MOOD:")) {
        for (const segment of line.split("MOOD:")) {
          if (["SUBJ", "JUS"].includes(segment)) {
            return segment;
          }
        }
      }
      return "IND";
    }
  }
  return null;
}
function getVoice(line: string) {
  if (line.includes("PASS")) {
    return "PASS";
  } else {
    return "ACT";
  }
}

function getForm(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.match(/\([a-zA-Z]*\)/)) {
      return segment;
    }
  }
}

function getDerivation(line: string): "ACT PCPL" | "PASS PCPL" | "VN" | undefined {
  if (line.includes("ACT|PCPL")) {
    return "ACT PCPL";
  }
  if (line.includes("PASS|PCPL")) {
    return "PASS PCPL";
  }
  if (line.includes("VN")) {
    return "VN";
  }
}
function getState(line: string): "DEF" | "INDEF" | undefined {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("INDEF")) {
      return "INDEF";
    }
    if (isIsm(line)) {
      return "DEF";
    }
  }
}
function getGrammaticalCase(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (["NOM", "GEN", "ACC"].includes(segment)) {
      return segment;
    }
  }
}

function getBuckWalter(line: string): string {
  return line.split(/[	|]/)[1];
}
function getPGN(line: string): string | undefined {
  for (const segment of line.split(/[|]/)) {
    if (!segment.startsWith("(") && segment.match(/\d+\w+/)) {
      return segment;
    }
  }
}
