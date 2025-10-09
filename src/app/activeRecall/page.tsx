"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Score from "./Score";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { WORD } from "@/types/types";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useLocalStorage } from "@/stores/localStorage";
import SelectChapters from "./SelectChapters";
import wordCount from "../../wordCount.json";
import getChapterLength from "./getChapterLength";
import MotionDiv from "@/components/MotionDiv";
import getVerseWords from "@/utils/getVerseWords";
import Start from "./Start";
import Verse from "@/components/Verse";
import AnimationLoop from "./AnimationLoop";
import VerseInfo from "./VerseInfo";
// import div from "@/components/div";
const wc = wordCount as { [key: number]: { [key: number]: string } };
export default function Page() {
  const [verse_key, setVerse_key] = useState<string | null>();
  const [verse, setVerse] = useState<WORD[]>([]); // the actual verse
  const [hold, setHold] = useState(false);

  const ARProgress = useOnlineStorage(useShallow((state) => state.ARProgress));
  const chapters = useLocalStorage(useShallow((state) => state.chapters));

  const reload = useCallback(
    async (signal: AbortSignal) => {
      setVerse([]);
      if (!verse_key) return; // if verse_key is null, do not set words
      try {
        if (signal.aborted) return;

        const words: WORD[] = [];
        words.push(
          ...(await getVerseWords(verse_key as `${string}:${string}`)).filter((word) => word.char_type_name == "word")
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
    [verse_key]
  );

  const setNextVerse = useCallback(() => {
    const nextChapter = chapters.sort((a, b) => {
      const iterationA = Math.floor(ARProgress[a] / getChapterLength(a));
      const iterationB = Math.floor(ARProgress[b] / getChapterLength(b));
      if (iterationA == iterationB) {
        return +a - +b; // put chapters with lower index first
      }
      return iterationA - iterationB; // put chapters with lower iteration first
    })[0];
    nextChapter
      ? setVerse_key(
          `${nextChapter}:${Math.trunc((ARProgress[nextChapter] % getChapterLength(nextChapter)) + 1)}` // set the next verse
        )
      : setVerse_key(null);
  }, [ARProgress, chapters]);

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
    !hold && chapters.length && setNextVerse(); // set a next verse if chapters is not empty
    return () => {};
  }, [chapters.length, hold, setNextVerse]);
  return (
    <>
      <div className="h-screen flex flex-col justify-between items-center">
        <Score />
        <div className="p-2 w-fit h-fit flex flex-col items-center justify-center gap-4 overflow-hidden">
          <div className="grid grid-cols-3 items-center justify-center gap-2">
            {/* reload Btn */}
            <Button
              variant={"outline"}
              onClick={() => {
                setNextVerse();
              }}
            >
              reload
            </Button>
            <div className="flex flex-col items-center justify-center gap-2">
              <AnimationLoop />
              <Start practiceMode {...{ verse, verse_key, setNextVerse, setHold }} />
              <Start {...{ verse, verse_key, setNextVerse, setHold }} />
            </div>
            <Button
              variant={"outline"}
              onClick={() => {
                verse_key &&
                  confirm("are you sure you want to skip this verse?") &&
                  useOnlineStorage.getState().addARProgress(+verse_key?.split(":")[0], 1);
              }}
            >
              Skip Verse {verse_key}
            </Button>
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}
