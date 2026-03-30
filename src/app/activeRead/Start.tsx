import MotionDiv from "@/components/MotionDiv";
import { Button, buttonVariants } from "@/components/ui/button";
import React, { use, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Verse from "@/components/Verse";
import { WORD } from "@/types/types";
import { toast } from "sonner";
import { useOnlineStorage } from "@/stores/onlineStorage";
import useVerseAudio from "@/components/useVerseAudio";
import _, { set } from "lodash";
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
import { EasingFactorSelector, validChunkSizes } from "./EasingFactorSelector";
import { Input } from "@/components/ui/input";
import Fuse from "fuse.js";
import { Label } from "@/components/ui/label";
import { useShallow } from "zustand/react/shallow";
import roundToTwo from "@/utils/roundToTwo";
import { CircularProgressButton } from "./CircularProgressButton";

export default function Start({
  verse,
  verse_key,
  setNextVerse,
  setHold,
}: {
  verse: WORD[];
  verse_key: string | null | undefined;
  setNextVerse: () => void;
  setHold: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [ARProgress] = useOnlineStorage(useShallow((state) => [state.ARProgress]));
  const { openedVerse, setOpenedVerse } = useVerseAudio();

  const verseCompleted: boolean = !!(verse_key && ARProgress[+verse_key?.split(":")[0]] === +verse_key?.split(":")[1]);

  if (verse_key && ARProgress[+verse_key?.split(":")[0]] !== +verse_key?.split(":")[1] - 1) {
    useLocalStorage.setState(() => ({ currentVerseScore: 0 })); // clear current verse score if wrong verse is loaded
  }
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
          <CircularProgressButton
            progress={(useLocalStorage.getState().currentVerseScore / verse.length ** 2) * 100}
            disabled={verse.length === 0}
            onClick={() => {
              setShow(false);
            }}
            className={cn(
              "font-black text-base md:text-2xl w-full flex flex-col p-4 rounded-full aspect-square align-middle items-center justify-center shadow-md  border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <div> {useLocalStorage.getState().currentVerseScore === 0 ? "Start" : "Continue"}:</div>
            <div>
              {" "}
              {verse.length === 0 ? (
                <Loader className="animate-spin" />
              ) : useLocalStorage.getState().currentVerseScore === 0 ? (
                ` ${roundToTwo(verse.length ** 2)}XP`
              ) : (
                <>{roundToTwo((useLocalStorage.getState().currentVerseScore / verse.length ** 2) * 100)}%</>
              )}
            </div>
          </CircularProgressButton>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-screen overflow-y-auto pt-0 grid-rows-[auto_1fr] auto-cols-[100%] ">
          <Score
            currentScore={userWords.length ** 2 / (divideBy * (maxLives > 0 ? maxLives : 1))}
            verseLength={verse.length}
            divideBy={divideBy}
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
              <Button className={cn(verseCompleted ? "hidden" : "")} variant={"outline"} onClick={redo}>
                {"Redo"}
              </Button>
              <Button
                variant={"outline"}
                onClick={() => {
                  if (confirm("are you sure you want to reset your progress for this verse?")) {
                    redo();
                    useLocalStorage.setState(() => ({ currentVerseScore: 0 }));
                  }
                }}
              >
                {verseCompleted ? (
                  "Redo"
                ) : (
                  <>
                    Reset Score {roundToTwo(useLocalStorage.getState().currentVerseScore)}/{verse.length ** 2}
                  </>
                )}
              </Button>
              {/* Done Btn */}
              <Button
                variant={"outline"}
                disabled={!verseCompleted}
                onClick={() => {
                  setHold(false);
                  setOpen(true);
                  setNextVerse();
                  setShow(false);
                  setUserWords([]);
                  setLives(maxLives);
                  setDivideBy(1);
                  useLocalStorage.setState(() => ({ currentVerseScore: 0 }));
                }}
              >
                Next
              </Button>
            </div>
            {/* verse */}
            {verse_key === null ? (
              <>no surah is selected</>
            ) : (
              <>
                {show && verse && (
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
    const score = ((userWords.length + 1) ** 2 - userWords.length ** 2) / (divideBy * (maxLives > 0 ? maxLives : 1));

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
      if (won) {
        setHold(true);
        toast.success(
          `You earned ${roundToTwo((userWords.length + 1) ** 2 / (divideBy * (maxLives > 0 ? maxLives : 1)))} points!`,
          {},
        );
      }
      const leveledUpped = (ARScore % goal) + score >= goal;
      if (leveledUpped) {
        toast.success(`Level Up!`, { position: "top-center" });
      }
      // add score
      useOnlineStorage.getState().addARScore(score);
      const currentVerseScore = useLocalStorage.getState().currentVerseScore;
      useLocalStorage.setState(() => ({ currentVerseScore: currentVerseScore + score }));
      const verseNowCompletes = currentVerseScore + score >= verse.length ** 2;
      if (verseNowCompletes) {
        verse_key && useOnlineStorage.getState().setARProgress(+verse_key?.split(":")[0], +verse_key?.split(":")[1]);
        toast.success(`verse mastered!`, { position: "bottom-right" });
      } else if (won && !verseCompleted) {
        toast.message(`Increasing difficulty !!!`, { position: "top-left" });

        if (divideBy === 1) {
          useLocalStorage.setState((state) => ({ maxLives: state.maxLives > 1 ? state.maxLives - 1 : 1 }));
        } else {
          const lessenedEasingFactors =
            validChunkSizes(verse.length)
              .filter((divisor) => Math.floor(verse.length / divisor) > 1)
              .filter((divisor) => divisor < divideBy)
              .sort((a, b) => b - a)[0] ?? 1;
          setDivideBy(lessenedEasingFactors);
        }
        redo();
      }
      if (won || leveledUpped || verseNowCompletes) {
        correctSoundEffect();
      }
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
      openedVerse !== verse_key // if audio is not playing
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
