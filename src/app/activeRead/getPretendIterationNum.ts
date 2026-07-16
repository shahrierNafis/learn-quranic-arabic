import getChapterLength from "./getChapterLength";

export default function getPretendIterationNum(chapter: number, QuranProgress: { [key: number]: number }) {
  if (QuranProgress[chapter] == 0) return 1;
  return Math.ceil((QuranProgress[chapter] - 0.0000001) / getChapterLength(chapter));
}
