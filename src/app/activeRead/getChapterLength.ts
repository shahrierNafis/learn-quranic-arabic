import wordCount from "../../wordCount.json";
const wc = wordCount as { [key: number]: { [key: number]: string } };
export default function getChapterLength(chapter: number) {
  return Object.values(wc[chapter]).length;
}
