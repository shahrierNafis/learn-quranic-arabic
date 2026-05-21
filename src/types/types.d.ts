export type Requirements = {
  shouldNotMatch: (keyof WordSegment)[];
  shouldMatch: (keyof WordSegment)[];
}[];

export type WORD = {
  text_imlaei: string;
  translation: { text: string };
  transliteration: { text: string };
  char_type_name: string;
  position: number;
  audio_url: string;
  index: `${string}:${string}:${string}`;
  wordSegments: WordData;
};
export type COLOR =
  | "purple"
  | "navy"
  | "orange"
  | "brown"
  | "gray"
  | "rose"
  | "sky"
  | "red"
  | "blue"
  | "rust"
  | "gold"
  | "seagreen"
  | "green"
  | "metal";
export type WordSegment = {
  // translation?: string;
  root?: string;
  lemma?: string;
  arabic: string;
  buckwalter: string;
  affix?: Affixes;

  person?: 1 | 2 | 3;
  gender?: "M" | "F";
  number?: "S" | "D" | "P";

  arPartOfSpeech: "ḥarf" | "fiʿil" | "ism" | "prefix" | "suffix";
  partOfSpeech: PartOfSpeech;
  position: string;

  aspect?: "PERF" | "IMPF" | "IMPV";
  mood?: "IND" | "SUBJ" | "JUS";
  voice?: "ACT" | "PASS";
  form?: string;

  derivation?: "ACT PCPL" | "PASS PCPL" | "VN";
  state?: "DEF" | "INDEF";
  grammaticalCase?: string;
};
export type OPTION = {
  wordSegments: WordData;
  isCorrect: boolean;
  index: 1 | 2 | 3 | 4;
  wordGroupId: number;
};
export type PrefixPOS = "DET" | "P" | "VOC" | "INTG" | "EQ" | "CONJ" | "REM" | "CIRC" | "SUP" | "COM" | "RSLT" | "CAUS";

export type Affixes =
  | "Al+"
  | "bi+"
  | "ka+"
  | "ta+"
  | "sa+"
  | "ya+"
  | "ha+"
  | "A:INTG+"
  | "A:EQ+"
  | "W:CONJ+"
  | "W:REM+"
  | "W:CIRC+"
  | "w:SUP+"
  | "w:P+"
  | "w:COM+"
  | "f:REM+"
  | "f:CONJ+"
  | "f:RSLT+"
  | "f:SUP+"
  | "f:CAUS+"
  | "l:P+"
  | "l:EMPH+"
  | "l:PRP+"
  | "l:IMPV+"
  | "+n:EMPH"
  | "+VOC";
export type WordData = WordSegment[];
export type WordCount = {
  [key: string]: {
    [key: string]: string;
  };
};
export type Objective = {
  type?: "lemma" | "affix" | "fillPGN" | "attachedPronoun" | "harf";
  values?: string[];
};
export type LI = {
  words: { position: string; segIndex: string }[];
  positions: string[];
  description: string;
  name: string;
  spellings?: Set<string>;
  getOptions: (position: string, segIndex: string, extraSegments?: WordSegment[]) => Promise<WordData[]>;
};
export type List = {
  [key: string]: LI;
};
export type CorpusApiWord = {
  token: {
    location: [number, number, number];
    translation: string;
    phonetic: string;
    segments: [
      {
        arabic: string;
        posTag: string;
        pronounType?: string;
      },
    ];
  };
  summary: string;
  segmentDescriptions: string[];
  arabicGrammar: string;
};

export type PartOfSpeech =
  | "N"
  | "PN"
  | "ADJ"
  | "IMPN"
  | "PRON"
  | "SUBJ"
  | "OBJ"
  | "OBJ2"
  | "DEM"
  | "REL"
  | "T"
  | "LOC"
  | "V"
  | "EMPH"
  | "IMPV"
  | "PRP"
  | "CONJ"
  | "SUB"
  | "ACC"
  | "AMD"
  | "ANS"
  | "AVR"
  | "CAUS"
  | "CERT"
  | "CIRC"
  | "COM"
  | "COND"
  | "EQ"
  | "EXH"
  | "EXL"
  | "EXP"
  | "FUT"
  | "INC"
  | "INT"
  | "INTG"
  | "NEG"
  | "PREV"
  | "PRO"
  | "REM"
  | "RES"
  | "RET"
  | "RSLT"
  | "SUP"
  | "SUR"
  | "VOC"
  | "INL"
  | "DET"
  | "P";

export type LemmaData = {
  lemma: string;
  positions: string[];
  count: number;
  rank: number;
};
