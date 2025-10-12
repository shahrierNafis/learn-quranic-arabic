import wordCount from "@/wordCount.json";
import { WordCount } from "@/types/types";

const wc = wordCount as WordCount;
let total = 0;
let totalCubed = 0;
for (const surah in wc) {
  for (const verse in wc[surah]) {
    total += Number(wc[surah][verse]);
    totalCubed += Number(wc[surah][verse]) ** 3;
  }
}
console.log(totalCubed);
console.log(total / 6236);
