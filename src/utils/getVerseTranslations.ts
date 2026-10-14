import getTranslationInfo from "./getTranslationInfo";
import reportIssue from "./reportIssue";

export default async function getVerseTranslations(
  translation_ids: string[],
  surahI: string,
  verseI: string
): Promise<(T & Awaited<ReturnType<typeof getTranslationInfo>>[number])[]> {
  if (!surahI || !verseI || Number.isNaN(+surahI) || Number.isNaN(+verseI)) return [];
  try {
    if (translation_ids.length == 0) return [];
    const { verse } = (await (await fetch(`https://api.quran.com/api/v4/verses/by_key/${surahI}:${verseI}?translations=${translation_ids.join(",")}`)).json()) ?? {
      verse: { translations: [] },
    };
    const info = await getTranslationInfo();
    return (
      verse.translations.map((t: T) => {
        return {
          ...t,
          ...info.filter((i) => {
            return i.id == t.resource_id;
          })[0],
        };
      }) ?? []
    );
  } catch (error) {
    console.log(` https://api.quran.com/api/v4/verses/by_key/${surahI}:${verseI}?translations=${translation_ids.join(",")} \n ${error}`);
    if (!navigator.onLine)
      if (confirm("Failed to fetch verse translations. Retry?")) return getVerseTranslations(translation_ids, surahI, verseI);
      else reportIssue();
    return [];
  }
}
type T = {
  id: number;
  resource_id: number;
  text: string;
};
