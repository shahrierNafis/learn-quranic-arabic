import fs from "fs";
import _ from "lodash";
let index = 0;
let prevPosition: string;
const wordCount = {};

fs.readFileSync("./quran-word-lists/morphology.txt")
  .toString()
  .split("\n")
  .forEach((line, lineIndex, lineArray) => {
    const lineSegments = line.split("	");
    const position = lineSegments[0].substring(1, lineSegments[0].length - 3);
    if (prevPosition && position !== prevPosition) {
      index++;
    }

    //set word count
    _.setWith(wordCount, [position.split(":")[0], position.split(":")[1]], position.split(":")[2], Object);
  });
fs.writeFile("./quran-word-lists/wordCount.json", JSON.stringify(wordCount), function (err) {
  if (err) throw err;
  console.log("./quran-word-lists/wordCount.json");
});
fs.writeFile("./src/wordCount.json", JSON.stringify(wordCount), function (err) {
  if (err) throw err;
  console.log("./src/wordCount.json");
});
