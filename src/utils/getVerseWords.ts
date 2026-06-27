import { WORD } from "@/types";
import { cache } from "react";
import reportIssue from "./reportIssue";

export default cache(async function getVerseWords(index: `${string}:${string}`, signal?: AbortSignal): Promise<WORD[]> {
  const [surahI, ayahI, wordI] = index.split(":");
  try {
    const verse = (
      await (
        await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${surahI}:${ayahI}?words=true&word_fields=text_imlaei`,
          { signal },
        )
      ).json()
    ).verse;
    const verseData = await (await fetch(`/api/get/data/${surahI}/${ayahI}`, { cache: "force-cache" })).json();
    return verse.words.map((word: WORD) => {
      const wordSegments = verseData[+word.position] ?? [];
      return {
        text_imlaei: word.text_imlaei,
        translation: word.translation,
        transliteration: word.transliteration,
        position: word.position,
        char_type_name: word.char_type_name,
        audio_url: word.audio_url,
        index: (verse.verse_key + ":" + word.position) as `${string}:${string}:${string}`,
        wordSegments,
      };
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // Fetch was aborted, handle it silently
      return [];
    } else {
      console.log(
        `Error while fetching the data: https://api.quran.com/api/v4/verses/by_key/${surahI}:${ayahI}?words=true&word_fields=text_imlaei \n ${error}`,
      );
      if (!navigator.onLine)
        if (confirm("Failed to fetch verse words. Retry?")) return getVerseWords(index);
        else reportIssue();
      return [];
    }
  }
});
