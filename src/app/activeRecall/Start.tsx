import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Verse from "@/components/Verse";
import { useShallow } from "zustand/shallow";
import { WORD } from "@/types/types";

import { createEmptyCard } from "ts-fsrs";
import { toast } from "sonner";
import { useOnlineStorage } from "@/stores/onlineStorage";
import useVerseAudio from "@/components/useVerseAudio";
import _ from "lodash";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import Translations from "@/components/Translations";
import Word from "@/components/Word";
import { Skeleton } from "@/components/ui/skeleton";
import VerseInfo from "./VerseInfo";
import LevelScore from "./LevelScore";
import { Loader } from "lucide-react";

export default function Start({
  verse,
  verse_key,
  setNextVerse,
  setHold,
  practiceMode = false,
}: {
  verse: WORD[];
  verse_key: string | null | undefined;
  setNextVerse: () => void;
  setHold: React.Dispatch<React.SetStateAction<boolean>>;
  practiceMode?: boolean;
}) {
  const [redIndex, setRedIndex] = useState<number>();
  const [show, setShow] = useState(false);
  const [words, setWords] = useState<WORD[]>([]); // the actual verse
  const [userWords, setUserWords] = useState<WORD[]>([]); // user input words
  const [open, setOpen] = useState(false);

  const { openedVerse, setOpenedVerse } = useVerseAudio();
  const wordList = useOnlineStorage(useShallow((a) => a.wordList));

  const reset = useCallback(() => {
    setUserWords([]);
    setWords(_.shuffle([...verse]));
  }, [verse]);

  useEffect(() => {
    setWords(_.shuffle(verse));
  }, [verse]);

  useEffect(() => {
    function handleReload() {
      reset();
      setShow(false);
    } // handle reload
    window.addEventListener("reload", handleReload);
    return () => {
      window.removeEventListener("reload", handleReload);
    };
  }, [reset]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full">
          <Button
            disabled={verse.length === 0}
            size={"lg"}
            variant="outline"
            onClick={() => {
              setHold(true);
              setShow(false);
            }}
            className="font-black text-xl md:text-2xl w-full"
          >
            {practiceMode
              ? `Practice:` + (verse.length !== 0 ? ` ${Math.round(verse.length ** 0.5)}XP` : "")
              : (userWords.length ? `Continue: ` : `Start: `) + (verse.length !== 0 ? `${verse.length ** 2}XP` : "")}
            {verse.length === 0 && <Loader className="animate-spin" />}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-full overflow-y-auto flex flex-col items-center justify-center gap-2">
          <LevelScore
            {...{
              score: practiceMode
                ? userWords.length == verse.length
                  ? Math.round(userWords.length ** 0.5) // full score if complete
                  : +(userWords.length ** 0.5).toFixed(1) // fractional score if not complete
                : userWords.length ** 2,
              scoreRequired: practiceMode ? Math.round(verse.length ** 0.5) : verse.length ** 2,
              parentage: Math.min(100, (userWords.length / verse.length) * 100),
            }}
          />
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-4">
              {/* show verse Btn */}
              <Button
                variant={show ? "secondary" : "outline"}
                onClick={() => {
                  setShow(!show);
                  penaltyFunc();
                }}
              >
                Read/Listen Verse
              </Button>
              {/* Done Btn */}
              <Button
                variant={"outline"}
                disabled={verse.length !== userWords.length}
                onClick={() => {
                  setHold(false);
                  setOpen(false);
                  setNextVerse();
                  setShow(false);
                  setUserWords([]);
                }}
              >
                Done
              </Button>
            </div>
            {/* verse */}
            {verse_key === null ? (
              <>no surah is selected</>
            ) : (
              <>
                {(show || practiceMode) && verse && (
                  <>
                    <motion.div
                      transition={{ duration: 0.25 }}
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      exit={{ y: -20 }}
                      layout
                      dir="rtl"
                      className="text-2xl md:text-3xl"
                    >
                      <Verse {...{ verse }}></Verse>
                    </motion.div>
                  </>
                )}
                <VerseInfo {...{ verse_key, verse }} />
                {/* USER WORDS */}
                <div dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-4">
                  {userWords.map((word) => {
                    return (
                      <MotionDiv key={word.index}>
                        <Button className="text-2xl md:text-3xl" variant={"outline"} size={"lg"}>
                          <Word
                            {...{
                              wordSegments: word.wordSegments,
                              word,
                              size: "lg",
                            }}
                          />
                        </Button>
                      </MotionDiv>
                    );
                  })}
                </div>
                {/* TRANSLATION */}
                <MotionDiv>
                  <Translations {...{ index: verse_key }}></Translations>
                </MotionDiv>
                <MotionDiv dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-4">
                  {/* words */}
                  {words.length ? (
                    words.map((word, i) => {
                      const userWordIds = userWords.map((w) => w.index);
                      return (
                        <MotionDiv
                          className={cn(userWordIds.includes(word.index) ? "border border-dashed rounded-md" : "")}
                          key={word.index}
                        >
                          <Button
                            style={{ visibility: userWordIds.includes(word.index) ? "hidden" : "visible" }}
                            className={cn(" text-2xl md:text-3xl", `${redIndex === i && "ring ring-red-400"}`)}
                            variant={redIndex === i ? "destructive" : "outline"}
                            size={"lg"}
                            disabled={userWords.length == verse.length}
                            onClick={() => {
                              onWordClick(word, i);
                            }}
                          >
                            <Word
                              {...{
                                wordSegments: word.wordSegments,
                                noWordInfo: true,
                                word,
                                size: "lg",
                              }}
                            />
                          </Button>
                        </MotionDiv>
                      );
                    })
                  ) : (
                    // if words are not loaded, show skeletons
                    <>
                      {userWords.length
                        ? ""
                        : Array(verse.length > 0 ? verse.length : 10)
                            .fill(1)
                            .map((a, i) => {
                              const randomWidth = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
                              return (
                                <MotionDiv key={i}>
                                  <Skeleton style={{ width: `${randomWidth}rem` }} className={`h-[48px] rounded-md`} />
                                </MotionDiv>
                              );
                            })}
                    </>
                  )}
                </MotionDiv>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  function onWordClick(word: WORD, i: number) {
    !practiceMode && setShow(false); // hide verse if not in practice mode
    setOpenedVerse(undefined); // close audio
    if (
      //mistake
      !(
        verse[userWords.length].text_imlaei == word.text_imlaei ||
        verse[userWords.length].wordSegments.map((ws) => ws.buckwalter).join() ==
          word.wordSegments.map((ws) => ws.buckwalter).join()
      )
    ) {
      setRedIndex(i);
      setTimeout(() => {
        setRedIndex(undefined);
        reset();
      }, 500);
    } else {
      if (userWords.length + 1 === verse.length) {
        // if verse is complete

        addNewCards(verse);

        // add ARProgress if not in practice mode
        !practiceMode && verse_key && useOnlineStorage.getState().addARProgress(+verse_key?.split(":")[0], 1);
        useOnlineStorage.getState().addARScore(practiceMode ? verse.length ** 0.5 : verse.length ** 2);
      }
      setUserWords((prev) => [...prev, word]);
    }
  }

  function penaltyFunc() {
    if (
      userWords.length !== verse.length && // if verse is not complete
      userWords.length && // if userWords is not empty
      openedVerse !== verse_key && // if audio is not playing
      !practiceMode
    )
      reset();
  }

  function addNewCards(verse: WORD[]) {
    let newWordAdded = 0;
    for (const word of verse) {
      if (word.char_type_name != "word") continue;
      for (const segment of word.wordSegments) {
        if (!(segment.arPartOfSpeech === "ism" || segment.arPartOfSpeech === "fiʿil")) continue; // if not a noun or verb
        if (!segment.lemma) continue;
        if (wordList[segment.lemma]) continue; // if already in wordList
        useOnlineStorage.getState().addToWordList(segment.lemma, {
          card: createEmptyCard(),
          index: word.index,
        });
        newWordAdded++;
      }
    }
    newWordAdded && toast(`${newWordAdded} new words are added to your word list.`);
  }
}
