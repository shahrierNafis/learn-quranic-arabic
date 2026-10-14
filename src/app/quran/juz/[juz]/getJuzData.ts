export default async function setJuzData(juz_number: number) {
  let juzs: {
    id: number;
    juz_number: number;
    verse_mapping: {
      [key: number]: `${number}-${number}`;
    };
    first_verse_id: number;
    last_verse_id: number;
    verses_count: number;
  }[] = (await (await fetch("https://api.quran.com/api/v4/juzs")).json()).juzs;
  const data: string[] = [];
  for (const juz of juzs) {
    if (juz.juz_number == juz_number) {
      for (const surah in juz.verse_mapping) {
        let [start, end] = juz.verse_mapping[surah].split("-");
        data.push("surah " + surah);
        while (start != end) {
          data.push(surah + ":" + start);
          start = +start + 1 + "";
        }
      }
    }
  }

  return data;
}
