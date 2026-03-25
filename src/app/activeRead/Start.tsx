import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Verse from "@/components/Verse";
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
import { Heart, Loader } from "lucide-react";
import useSound from "use-sound";
import { useLocalStorage } from "@/stores/localStorage";
import Score from "./Score";
import { EasingFactorSelector } from "./EasingFactorSelector";
import { Input } from "@/components/ui/input";
import Fuse from "fuse.js";
import { Label } from "@/components/ui/label";

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
  const [divisions, setDivisions] = useState<WORD[][]>([[]]); // the actual verse
  const [userWords, setUserWords] = useState<WORD[]>([]); // user input divisions
  const [open, setOpen] = useState(false);
  const maxLives = useLocalStorage((state) => state.maxLives);
  const [lives, setLives] = useState(maxLives);
  const correctSoundEffect = useSound("/audio/duolingo-correct.mp3")[0];
  const wrongSoundEffect = useSound("/audio/duolingo-wrong.mp3")[0];
  const [divideBy, setDivideBy] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { openedVerse, setOpenedVerse } = useVerseAudio();

  const reset = useCallback(() => {
    setUserWords([]);
    const chunkedArray = chunkArray(verse, +(verse.length / divideBy).toFixed(2));
    setDivisions(chunkedArray.map((chunk) => _.shuffle(chunk)));
  }, [divideBy, verse]);

  useEffect(() => {
    reset();
  }, [reset, verse]);

  function redo() {
    userWords.length !== 0 && reset();
    verse_key && useOnlineStorage.getState().setARProgress(+verse_key?.split(":")[0], +verse_key?.split(":")[1] - 1);
  }

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
            className="font-black text-base md:text-2xl w-full"
          >
            {difficulty === 1 ? `Practice:` : `Start:`}
            {verse.length === 0 ? <Loader className="animate-spin" /> : ` ${verse.length ** difficulty}XP`}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-screen overflow-y-auto pt-0 grid-rows-[auto_1fr] auto-cols-[100%] ">
          <Score
            currentScore={userWords.length ** difficulty / (divideBy * (maxLives > 0 ? maxLives : 1))}
            fullScore={verse.length ** difficulty / (divideBy * (maxLives > 0 ? maxLives : 1))}
          />
          <div className="flex flex-col items-center justify-start gap-4">
            <div className="flex items-center justify-center gap-4 flex-wrap w-full">
              <EasingFactorSelector {...{ divideBy, setDivideBy, verseLength: verse.length, onValueChange: redo }} />
              <div className="relative w-fit shrink-0">
                <Input
                  id="max-lives"
                  type="number"
                  className="text-right w-36"
                  value={maxLives}
                  max={verse.length}
                  onChange={(e) => {
                    const value = +e.target.value > 0 ? +e.target.value : 1;
                    useLocalStorage.setState((state) => ({ ...state, maxLives: value }));
                    setLives(value);
                    redo();
                  }}
                  placeholder="Max Lives"
                />
                <Label
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground text-sm transition-all peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-xs"
                  htmlFor="max-lives"
                >
                  Max Lives:
                </Label>
              </div>
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
              <Button variant={"outline"} onClick={redo}>
                Redo
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
                  setLives(maxLives);
                  setDivideBy(1);
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
                {/* USER DIVISIONS */}
                <div dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-2">
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
                <Input
                  value={searchTerm}
                  className="max-w-md"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search words..."
                />
                {/* divisions */}
                {divisions.length ? (
                  divisions.map((division, i) => {
                    const options = {
                      includeScore: true,
                      // Search in `author` and in `tags` array
                      keys: ["text_imlaei", "transliteration.text"],
                    };

                    const fuse = new Fuse(division, options);

                    const result = searchTerm
                      ? fuse.search(searchTerm)
                      : division.map((word) => ({ item: word, score: 1 }));

                    if (division.every((word) => userWords.map((w) => w.index).includes(word.index))) {
                      return <></>;
                    } else {
                      return (
                        <MotionDiv
                          key={"division-" + i}
                          dir="rtl"
                          className={cn(
                            "flex flex-wrap items-center justify-center w-full gap-2 p-4 shadow-xl border rounded-md ",
                          )}
                        >
                          {result.map((FuseResult) => {
                            const word = FuseResult.item;
                            const userWordIds = userWords.map((w) => w.index);
                            return (
                              <MotionDiv
                                className={cn(
                                  "border border-transparent rounded-md",
                                  userWordIds.includes(word.index) ? "border border-dashed rounded-md" : "",
                                )}
                                key={word.index}
                              >
                                <Button
                                  style={{
                                    visibility: userWordIds.includes(word.index) ? "hidden" : "visible",
                                  }}
                                  className={cn(
                                    " text-2xl md:text-3xl",
                                    `${redIndex === i && "border border-input ring ring-red-400"}`,
                                  )}
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
                          })}
                        </MotionDiv>
                      );
                    }
                  })
                ) : (
                  // if divisions are not loaded, show skeletons
                  <>
                    <MotionDiv dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-4">
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
                    </MotionDiv>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>{" "}
      {open && (
        <div className="flex items-center justify-center gap-2 fixed bottom-4 right-4 z-[999]">
          {Array.from({ length: maxLives - lives })
            .map((_, i) => i + 1)
            .reverse()
            .map((l) => (
              <div key={"life " + l}>
                <Heart className="w-8 " />
              </div>
            ))}{" "}
          {Array.from({ length: lives })
            .map((_, i) => i + 1)
            .reverse()
            .map((l) => (
              <div key={"life " + l}>
                <Heart className="w-8 fill-red-500" />
              </div>
            ))}
        </div>
      )}
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
    const score =
      ((userWords.length + 1) ** difficulty - userWords.length ** difficulty) /
      (divideBy * (maxLives > 0 ? maxLives : 1));

    if (madeMistake) {
      setLives((prev) => prev - 1);
      setRedIndex(i);

      setTimeout(() => {
        setRedIndex(undefined);
        if (lives - 1 === 0) {
          reset();
          toast.error(`You lost all your lives`, {});
          setLives(maxLives);
        }
      }, 500);
      wrongSoundEffect();
    } else {
      setUserWords((prev) => [...prev, word]);
      setLives((prev) => (prev + 1 > maxLives ? maxLives : prev + 1));
      const ARScore = useOnlineStorage.getState().ARScore;
      const goal = useLocalStorage.getState().goal;
      const relativeScore = ARScore - useLocalStorage.getState().lastScore + score;
      if (won) {
        setHold(true);
        toast.success(`You earned ${Math.round(relativeScore * 100) / 100} points!`, {});
        correctSoundEffect();
        // add ARProgress if not in practice mode
        difficulty !== 1 &&
          verse_key &&
          useOnlineStorage.getState().setARProgress(+verse_key?.split(":")[0], +verse_key?.split(":")[1]);
      }
      const leveledUpped = (ARScore % goal) + score >= goal;
      if (leveledUpped) {
        correctSoundEffect();
        toast.success(`Level Up!`, { position: "top-center" });
        toast.success(`${Math.round(relativeScore * 100) / 100} XP`);
      }
      if (won || leveledUpped) useLocalStorage.setState(() => ({ lastScore: ARScore + score }));
      // add score
      useOnlineStorage.getState().addARScore(score);
      const [s, v, w] = word.index.split(":");
      new Audio(
        "https://audio.qurancdn.com/" + `wbw/${s.padStart(3, "0")}_${v.padStart(3, "0")}_${w.padStart(3, "0")}.mp3`,
      ).play();
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
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    if (i + 1 > array.length) {
      chunkedArray[chunkedArray.length - 1].push(array[array.length - 1]);
      break;
    }
    // Slice a portion of the array from the current index up to the chunk size
    const chunk = array.slice(i, i + chunkSize);
    chunkedArray.push(chunk);
  }
  return chunkedArray;
}
