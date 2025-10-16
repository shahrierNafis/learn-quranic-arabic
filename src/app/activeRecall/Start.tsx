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
import { playSound, useSound } from "react-sounds";
import { useLocalStorage } from "@/stores/localStorage";

export default function Start({
  verse,
  verse_key,
  setNextVerse,
  setHold,
  difficulty = 2,
}: {
  verse: WORD[];
  verse_key: string | null | undefined;
  setNextVerse: () => void;
  setHold: React.Dispatch<React.SetStateAction<boolean>>;
  difficulty: number;
}) {
  const [redIndex, setRedIndex] = useState<number>();
  const [show, setShow] = useState(false);
  const [words, setWords] = useState<WORD[]>([]); // the actual verse
  const [userWords, setUserWords] = useState<WORD[]>([]); // user input words
  const [open, setOpen] = useState(false);

  const correctSoundEffect = useSound("/audio/duolingo-correct.mp3").play;
  const wrongSoundEffect = useSound("/audio/duolingo-wrong.mp3").play;

  const { openedVerse, setOpenedVerse } = useVerseAudio();
  const wordList = useOnlineStorage(useShallow((a) => a.wordList));

  const reset = useCallback(() => {
    setUserWords([]);
    setWords(_.shuffle(verse));
  }, [verse]);

  useEffect(() => {
    reset();
  }, [reset, verse]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() => {
          userWords.length !== verse.length && addScore(userWords.length ** difficulty, true); // do not add score if verse is completed and score is already added
          setOpen(!open);
          reset();
        }}
      >
        <DialogTrigger disabled={verse.length === 0} className="w-full">
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
            {difficulty === 1 ? `Practice:` : `Start:`}
            {verse.length === 0 ? <Loader className="animate-spin" /> : ` ${verse.length ** difficulty}XP`}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-screen overflow-y-auto pt-0 grid-rows-[auto_1fr]">
          <LevelScore
            {...{
              score: userWords.length ** difficulty,
              scoreRequired: verse.length ** difficulty,
              parentage: Math.min(100, (userWords.length ** difficulty / verse.length ** difficulty) * 100),
            }}
          />
          <div className="flex flex-col items-center justify-start gap-4">
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
                {(show || difficulty === 1) && verse && (
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
                            style={{
                              visibility: userWordIds.includes(word.index) ? "hidden" : "visible",
                            }}
                            className={cn(" text-2xl md:text-3xl", `${redIndex === i && "ring ring-red-400"}`)}
                            variant={redIndex === i ? "destructive" : "outline"}
                            size={"lg"}
                            disabled={userWords.length == verse.length}
                            onClick={() => {
                              onWordClick(word, i);
                            }}
                          >
                            <Word
                              asChild
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
    setOpenedVerse(undefined); // close audio
    setShow(false); // hide verse
    const madeMistake = !(
      verse[userWords.length].text_imlaei == word.text_imlaei ||
      verse[userWords.length].wordSegments.map((ws) => ws.buckwalter).join() ==
        word.wordSegments.map((ws) => ws.buckwalter).join()
    );
    const won = userWords.length + 1 === verse.length;
    if (madeMistake) {
      addScore(userWords.length ** difficulty);
      setRedIndex(i);
      setTimeout(() => {
        setRedIndex(undefined);
        reset();
      }, 500);

      wrongSoundEffect();
    } else {
      if (won) {
        // addNewCards(verse);

        // add ARProgress if not in practice mode
        difficulty !== 1 && verse_key && useOnlineStorage.getState().addARProgress(+verse_key?.split(":")[0], 1);

        // add score
        addScore((userWords.length + 1) ** difficulty);
      }
      // game continues
      const [s, v, w] = word.index.split(":");
      playSound(
        "https://audio.qurancdn.com/" + `wbw/${s.padStart(3, "0")}_${v.padStart(3, "0")}_${w.padStart(3, "0")}.mp3`
      );

      setUserWords((prev) => [...prev, word]);
    }
  }

  function penaltyFunc() {
    if (
      userWords.length !== verse.length && // if verse is not complete
      userWords.length && // if userWords is not empty
      openedVerse !== verse_key && // if audio is not playing
      difficulty !== 1 // if not in practice mode
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
  function addScore(score: number, noDrawer?: boolean) {
    if (score > 0) {
      // only show toast if user made some progress

      if (!noDrawer) {
        dispatchEvent(new CustomEvent("openScoreDrawer", { detail: { score } }));
      }

      setTimeout(() => {
        const ARScore = useOnlineStorage.getState().ARScore;
        const goal = useLocalStorage.getState().goal;
        if ((ARScore % goal) + score > goal) {
          const two = ((ARScore % goal) + score) % goal;
          const one = score - two - 0.1;
          correctSoundEffect();
          useOnlineStorage.getState().addARScore(one);

          setTimeout(() => {
            useOnlineStorage.getState().addARScore(0.1);
          }, 500);
          setTimeout(() => {
            correctSoundEffect();
            useOnlineStorage.getState().addARScore(two);
          }, 1000);
        } else {
          correctSoundEffect();
          useOnlineStorage.getState().addARScore(score);
        }
        toast.success(`You earned ${score} XP!`, {});
      }, 1000);
    }
  }
}
