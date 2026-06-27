import { Requirements } from "../../src/types";

export const lemmaRequirements: Requirements = [
  {
    shouldNotMatch: ["lemma"],
    shouldMatch: [
      "partOfSpeech",
      "person",
      "gender",
      "number",

      "aspect",
      "mood",
      "voice",
      "form",

      "derivation",
      "state",
      "grammaticalCase",
    ],
  },
  {
    shouldNotMatch: ["lemma"],
    shouldMatch: ["partOfSpeech", "person", "gender", "number", "form"],
  },
  {
    shouldNotMatch: ["lemma"],
    shouldMatch: ["arPartOfSpeech"],
  },
];

export const HarfRequirement: Requirements = [
  {
    shouldNotMatch: ["arabic", "partOfSpeech"],
    shouldMatch: ["arPartOfSpeech"],
  },
  {
    shouldNotMatch: ["arabic"],
    shouldMatch: ["arPartOfSpeech"],
  },
];
