import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Verse from "@/components/Verse";
import { useShallow } from "zustand/shallow";
import { WORD } from "@/types/types";
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
import { Loader } from "lucide-react";
import { playSound, useSound } from "react-sounds";
import { useLocalStorage } from "@/stores/localStorage";
import Score from "./Score";

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
          setOpen(!open);
          setHold(!open);
          reset();
        }}
      >
        <DialogTrigger disabled={verse.length === 0} className="w-full">
          <Button
            disabled={verse.length === 0}
            size={"lg"}
            variant="outline"
            onClick={() => {
              setShow(false);
            }}
            className="font-black text-xl md:text-2xl w-full"
          >
            {difficulty === 1 ? `Practice:` : `Start:`}
            {verse.length === 0 ? <Loader className="animate-spin" /> : ` ${verse.length ** difficulty}XP`}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-screen overflow-y-auto pt-0 grid-rows-[auto_1fr]">
          {/* <div>
            {" "}
            <currentScore
              {...{
                score: userWords.length ** difficulty,
                fullScore: verse.length ** difficulty,
                parentage: Math.min(100, (userWords.length ** difficulty / verse.length ** difficulty) * 100),
              }}
            /> */}
          <Score currentScore={userWords.length ** difficulty} fullScore={verse.length ** difficulty} />
          {/* </div> */}
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
    const score = (userWords.length + 1) ** difficulty - userWords.length ** difficulty;

    if (madeMistake) {
      setRedIndex(i);

      setTimeout(() => {
        setRedIndex(undefined);
        reset();
      }, 500);
      userWords.length &&
        toast.success(`You made a mistake!!! but still earned ${userWords.length ** difficulty} points!`, {});
      wrongSoundEffect();
    } else {
      if (won) {
        setHold(true);
        toast.success(`You earned ${(userWords.length + 1) ** difficulty} points!`, {});
        correctSoundEffect();
        // add ARProgress if not in practice mode
        difficulty !== 1 && verse_key && useOnlineStorage.getState().addARProgress(+verse_key?.split(":")[0], 1);
      }
      const ARScore = useOnlineStorage.getState().ARScore;
      const goal = useLocalStorage.getState().goal;
      if ((ARScore % goal) + score >= goal) {
        correctSoundEffect();
        toast.success(`Level Up!`, {});
      }
      // add score
      useOnlineStorage.getState().addARScore(score);
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
}
