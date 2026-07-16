"use client";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Score from "./Score";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { LemmaData, WORD } from "@/types";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useLocalStorage } from "@/stores/localStorage";
import getChapterLength from "./getChapterLength";
import getVerseWords from "@/utils/getVerseWords";
import Start from "./Start";
import { toast } from "sonner";
import useSound from "use-sound";
import roundToTwo from "@/utils/roundToTwo";
import getLemmaDataArr from "./getLemmaDataArr";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import Nav from "./Nav";
export default function Page() {
  const [verse_key, setVerse_key] = useState<string | null>(null);
  const [verse, setVerse] = useState<WORD[]>([]); // the actual verse
  const [hold, setHold] = useState(false);

  const QuranProgress = useOnlineStorage((state) => state.QuranProgress);
  const addQuranProgress = useOnlineStorage(useShallow((state) => state.addQuranProgress));
  const chapters = useLocalStorage((state) => state.chapters);
  const correctSoundEffect = useSound("/audio/duolingo-correct.mp3")[0];
  const [order] = useLocalStorage(useShallow((state) => [state.order]));
  const ranks = useOnlineStorage((state) => state.ranks);
  const [lemmaDataArr, setLemmaDataArr] = useState<LemmaData[]>([]);

  useEffect(() => {
    getLemmaDataArr().then(setLemmaDataArr);
  }, []);

  const reload = useCallback(
    async (signal: AbortSignal) => {
      setVerse([]);
      if (!verse_key) return; // if verse_key is null, do not set words
      try {
        if (signal.aborted) return;

        const words: WORD[] = [];
        words.push(
          ...(await getVerseWords(verse_key as `${string}:${string}`)).filter((word) => word.char_type_name == "word"),
        );
        setVerse(words.filter((word) => word.char_type_name == "word"));

        if (signal.aborted) return;
      } catch (error: any) {
        // Only log non-abort errors
        if (error.name !== "AbortError") {
          console.error("Error fetching words:", error);
        }
      }
    },
    [verse_key],
  );

  const currentRank: [number, number] = useMemo(() => {
    const c = Math.max(
      lemmaDataArr.findIndex((element, index) => (ranks[index] ?? 0) < element.count && ranks[index] != 10),
      0,
    );
    return [c, ranks[c] ?? 0];
  }, [lemmaDataArr, ranks]);

  const setNextVerse = useCallback(() => {
    if (order === "frequency") {
      console.log("currentRank", currentRank);
      if (currentRank.length && lemmaDataArr.length) {
        const lemma = lemmaDataArr[currentRank[0]] as LemmaData;
        setVerse_key(lemma.positions[ranks[currentRank[0]] ?? 0]);
      }
    } else {
      setVerse_key(null);
      const nextChapter = [...chapters].sort((a, b) => {
        const iterationA = Math.floor(QuranProgress[a] / getChapterLength(a));
        const iterationB = Math.floor(QuranProgress[b] / getChapterLength(b));
        if (iterationA == iterationB) {
          return +a - +b; // put chapters with lower index first
        }
        return iterationA - iterationB; // put chapters with lower iteration first
      })[0];
      nextChapter
        ? setVerse_key(
            `${nextChapter}:${Math.trunc((QuranProgress[nextChapter] % getChapterLength(nextChapter)) + 1)}`, // set the next verse
          )
        : setVerse_key(null);
    }
  }, [QuranProgress, chapters, currentRank, lemmaDataArr, ranks, order]);

  useEffect(() => {
    // Create an AbortController for this effect instance
    const abortController = new AbortController();
    const signal = abortController.signal;
    reload(signal);
    return () => {
      abortController.abort();
    };
  }, [reload, verse_key]);

  useEffect(() => {
    !hold && setNextVerse(); // set a next verse if chapters is not empty
    return () => {};
  }, [hold, setNextVerse]);

  useEffect(() => {
    if ([10, lemmaDataArr[currentRank[0]]?.count].includes(ranks[currentRank[0]])) {
      toast.success(
        `Rank up! You reached rank ${ranks[currentRank[0]]} & mastered the word "${buckwalterToArabic(lemmaDataArr[currentRank[0]]?.lemma)}"`,
        {},
      );
    }

    return () => {};
  }, [currentRank, lemmaDataArr, ranks]);
  if (!currentRank) return <div>Loading...</div>;

  return (
    <>
      <div className="h-screen auto-cols-[100%] grid grid-rows-3 justify-items-center content-center items-center ">
        <Nav />
        <div className="p-2 w-fit h-fit flex flex-col items-center justify-center gap-4 overflow-hidden">
          <div className="grid grid-cols-3 items-center content-center gap-2">
            {/* reload Btn */}
            <Button
              variant={"outline"}
              onClick={() => {
                setVerse_key(null);
                setHold(false);
                setVerse([]);
                setNextVerse();
              }}
            >
              reload
            </Button>
            <div className="flex flex-col items-center justify-center gap-2">
              <Start {...{ verse, verse_key, setNextVerse, setHold, currentRank, lemmaDataArr }} />
            </div>
            <Button
              variant={"outline"}
              onClick={() => {
                if (confirm("are you sure you want to skip this verse?") === false) return;
                useLocalStorage.getState().currentVerse.score > 0 &&
                  toast.success(`You earned ${roundToTwo(useLocalStorage.getState().currentVerse.score)} points!`, {});
                correctSoundEffect();
                useLocalStorage.setState(() => ({
                  currentVerse: {
                    score: 0,
                    verse_key: useLocalStorage.getState().currentVerse.verse_key,
                  },
                }));
                if (order === "frequency") {
                  useOnlineStorage.setState((state) => {
                    const newRanks = [...state.ranks];
                    newRanks[currentRank[0]] = (newRanks[currentRank[0]] ?? 0) + 1;

                    return { ranks: newRanks };
                  });
                } else verse_key && addQuranProgress(+verse_key?.split(":")[0], 1);
              }}
              dir="ltr"
            >
              Skip{" "}
              {order === "frequency" ? (
                <div className=" flex gap-2 flex-row">
                  <div> {buckwalterToArabic(lemmaDataArr[currentRank[0]]?.lemma)} </div>
                  <div>
                    {currentRank[1]}/{Math.min(10, lemmaDataArr[currentRank[0]]?.count)}
                  </div>
                </div>
              ) : (
                <>Verse {verse_key?.split(":")[0] + ":" + verse_key?.split(":")[1]}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
