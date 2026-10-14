export default async function setSurahData(surah: number) {
  let verseCount = (
    await (await fetch("https://api.quran.com/api/v4/chapters/" + surah)).json()
  ).chapter.verses_count;
  const data: string[] = [];
  while (verseCount) {
    data.push(surah + ":" + verseCount);
    verseCount--;
  }
  return data.reverse();
}
