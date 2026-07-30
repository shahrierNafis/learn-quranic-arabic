import React, { memo, useEffect, useState } from "react";

import getVerseWords from "@/utils/getVerseWords";

import { WORD } from "@/types";

import { cn } from "@/lib/utils";

import { Skeleton } from "./ui/skeleton";

import getVerseTranslations from "@/utils/getVerseTranslations";

import Translations from "./Translations";

import Word from "./Word";
import Verse from "./Verse";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default memo(
  function CellComponent({ verse_key, translation_ids }: { verse_key: string; translation_ids: string[] }) {
    const [verse, setVerse] = useState<WORD[]>();
    const [translations, setTranslations] = useState<Awaited<ReturnType<typeof getVerseTranslations>>>();
    const displayPreferences = useQuery(api.displayPreferences.get);
    const showTranslation = displayPreferences?.showTranslation ?? true;
    const showTransliteration = displayPreferences?.showTransliteration ?? true;

    // set verse
    useEffect(() => {
      getVerseWords(verse_key as `${string}:${string}${string}`).then(setVerse);

      return () => {};
    }, [verse_key]);
    // set translation
    useEffect(() => {
      const [surah, verse] = verse_key.split(":");
      surah && verse && getVerseTranslations(translation_ids, surah, verse).then((r) => setTranslations(r));

      return () => {};
    }, [translation_ids, verse_key]);

    return (
      <div className="flex flex-col gap-2 justify-center items-center min-w-3xl">
        <div key={verse_key} dir="rtl" className="flex gap-2 flex-wrap  text-center text-2xl">
          {/* ARABIC */}
          {verse ? (
            <Verse
              {...{
                switchIndex: verse_key.split(":")[2] ? +verse_key.split(":")[2] - 1 : undefined,
                highlightIndex: verse_key.split(":")[2] ? +verse_key.split(":")[2] - 1 : undefined,
                verse,
              }}
            />
          ) : (
            <>
              <Skeleton className="w-[75vw] h-11.25 rounded-full" />
            </>
          )}
        </div>
        {/* TRANSLATION */}
        <Translations {...{ translations, index: verse_key }}></Translations>
      </div>
    );
  },
  (prev, next) => {
    return prev.verse_key == next.verse_key && prev.translation_ids.every((e, i) => next.translation_ids[i] == e);
  },
);

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
