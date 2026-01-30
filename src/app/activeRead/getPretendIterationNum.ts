import getChapterLength from "./getChapterLength";

export default function getPretendIterationNum(
  chapter: number,
  ARProgress: { [key: number]: number }
) {
  if (ARProgress[chapter] == 0) return 1;
  return Math.ceil(
    (ARProgress[chapter] - 0.0000001) / getChapterLength(chapter)
  );
}
