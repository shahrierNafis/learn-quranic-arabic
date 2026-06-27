import { Requirements, WordData, WordSegment } from "../../src/types";

type Data = Record<string, Record<string, Record<string, WordData>>>;
type FlattenedData = Record<string, WordData>;

let flattenedDataCache: FlattenedData | null = null;
export default async function getOptions(
  position: string,
  segIndex: string,
  requirements: Requirements,
  extraSegments: WordSegment[] = [],
): Promise<WordData[]> {
  const data: Data = require("./../data.json");
  const [surah, verse, word] = position.split(":").map(Number);
  const wordData = data[surah][verse][word];

  // Initialize or get cached data
  if (!flattenedDataCache) {
    flattenedDataCache = flattenDataObject(data);
  }
  const shuffledData = fisherYatesShuffle(Object.values(flattenedDataCache));

  const segments = await findMatchingSegments(wordData, segIndex, requirements, extraSegments, shuffledData);

  if (segments.length !== 3) {
    throw new Error(`Failed to find required segments: ${JSON.stringify(wordData)}`);
  }

  return segments.map((segment) => createNewWordData(wordData, segment, segIndex));
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function findMatchingSegments(
  wordData: WordData,
  segIndex: string,
  requirements: Requirements,
  extraSegments: WordSegment[],
  shuffledData: WordData[],
): Promise<WordSegment[]> {
  const segments: WordSegment[] = [];

  for (const { shouldNotMatch, shouldMatch } of requirements) {
    if (segments.length === 3) break;

    for (const randomWordData of shuffledData) {
      if (segments.length === 3) break;

      for (const randomSegment of randomWordData) {
        if (segments.length === 3) break;

        if (isSegmentValid(randomSegment, wordData[+segIndex], segments, extraSegments, shouldNotMatch, shouldMatch)) {
          segments.push(randomSegment);
        }
      }
    }
  }

  return segments;
}

function isSegmentValid(
  segment: WordSegment,
  baseSegment: WordSegment,
  existingSegments: WordSegment[],
  extraSegments: WordSegment[],
  shouldNotMatch: string[],
  shouldMatch: string[],
): boolean {
  const allSegments = [baseSegment, ...existingSegments, ...extraSegments];

  return allSegments.every((existing) =>
    Object.keys(existing).every((key) => {
      if (shouldNotMatch.includes(key)) {
        return segment[key as keyof WordSegment] !== existing[key as keyof WordSegment];
      }
      if (shouldMatch.includes(key)) {
        return segment[key as keyof WordSegment] === existing[key as keyof WordSegment];
      }
      return true;
    }),
  );
}

function createNewWordData(originalData: WordData, segment: WordSegment, segIndex: string): WordData {
  const newData = structuredClone(originalData);
  newData[+segIndex] = segment;

  if (originalData.length !== newData.length) {
    throw new Error("Word data length mismatch after modification");
  }

  return newData;
}

function flattenDataObject(data: Data): FlattenedData {
  return Object.entries(data).reduce((result, [surah, verses]) => {
    Object.entries(verses).forEach(([verse, words]) => {
      Object.entries(words).forEach(([word, wordData]) => {
        result[`${surah}:${verse}:${word}`] = wordData;
      });
    });
    return result;
  }, {} as FlattenedData);
}
