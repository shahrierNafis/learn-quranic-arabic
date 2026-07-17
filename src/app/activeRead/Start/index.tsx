import React, { useCallback, useEffect, useState } from "react";

import _ from "lodash";
import { toast } from "sonner";
import useSound from "use-sound";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

import { cn } from "@/utils/cn";
import roundToTwo from "@/utils/roundToTwo";
import { Input } from "@/components/ui/input";
import MotionDiv from "@/components/MotionDiv";
import { LemmaData, WORD } from "@/types";
import { useShallow } from "zustand/react/shallow";
import Translations from "@/components/Translations";
import useVerseAudio from "@/components/useVerseAudio";
import { useLocalStorage } from "@/stores/localStorage";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import Verse from "@/components/Verse";

import Score from "../Score";
import VerseInfo from "../VerseInfo";
import WordBank from "./WordBank";
import LivesDisplay from "./LivesDisplay";
import UserWordsRow from "./UserWordsRow";
import VerseControls from "./VerseControls";
import DailyGoalsDialog from "./DailyGoalsDialog";
import { CircularProgressButton } from "./CircularProgressButton";
import { validChunkSizes } from "../EasingFactorSelector";

export default function Start({
  verse,
  verse_key,
  setNextVerse,
  setHold,
  currentRank,
  lemmaDataArr,
}: {
  verse: WORD[];
  verse_key: string | null | undefined;
  setNextVerse: () => void;
  setHold: React.Dispatch<React.SetStateAction<boolean>>;
  currentRank: [number, number];
  lemmaDataArr: LemmaData[];
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
  const { audioVerse, setAudioVerse } = useVerseAudio();
  const [order] = useLocalStorage(useShallow((state) => [state.order]));
  const [openDailyGoals, setOpenDailyGoals] = useState(false);
  const verseCompleted: boolean = useLocalStorage.getState().currentVerse.score >= verse.length ** 2;

  if (verse_key && useLocalStorage.getState().currentVerse.verse_key !== verse_key) {
    useLocalStorage.setState(() => ({
      currentVerse: {
        score: 0,
        verse_key:
          order === "frequency"
            ? (lemmaDataArr[currentRank[0]]?.positions[currentRank[1]] as `${string}:${string}`)
            : verse_key,
      },
    })); // clear current verse score if wrong verse is loaded
  }

  const reset = useCallback(() => {
    setUserWords([]);
    const chunkedArray = chunkArray(verse, +(verse.length / divideBy).toFixed(2));
    setDivisions(chunkedArray.map((chunk) => _.shuffle(chunk)));
  }, [divideBy, verse]);

  useEffect(() => {
    reset();
  }, [reset, verse]);

  useEffect(() => {
    if (userWords.length && useLocalStorage.getState().currentVerse.score >= verse.length ** 2) {
      setOpenDailyGoals(true);
    }
  }, [userWords.length, verse]);

  function redo() {
    useLocalStorage.setState((state) => ({ currentVerse: { ...state.currentVerse, score: 0 } }));
    userWords.length !== 0 && reset();
    order === "quran" &&
      verse_key &&
      useOnlineStorage.getState().setQuranProgress(+verse_key?.split(":")[0], +verse_key?.split(":")[1] - 1);
    order === "frequency" &&
      currentRank.length &&
      lemmaDataArr.length &&
      useOnlineStorage.setState((state) => {
        const newRanks = [...state.ranks];
        newRanks[currentRank[0]] = currentRank[1] - 1;
        return { ranks: newRanks };
      });
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
            progress={(useLocalStorage.getState().currentVerse.score / verse.length ** 2) * 100}
            disabled={verse.length === 0}
            onClick={() => {
              setShow(false);
            }}
            className={cn(
              "font-black text-base md:text-2xl w-full flex flex-col p-4 rounded-full aspect-square align-middle items-center justify-center shadow-md  border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <div> {useLocalStorage.getState().currentVerse.score === 0 ? "Start" : "Continue"}:</div>
            <div>
              {" "}
              {verse.length === 0 ? (
                <Loader className="animate-spin" />
              ) : useLocalStorage.getState().currentVerse.score === 0 ? (
                ` ${roundToTwo(verse.length ** 2)}XP`
              ) : (
                <>{roundToTwo((useLocalStorage.getState().currentVerse.score / verse.length ** 2) * 100)}%</>
              )}
            </div>
          </CircularProgressButton>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-full h-screen overflow-y-auto pt-0 grid-rows-[auto_1fr] auto-cols-[100%] ">
          <Score
            currentScore={userWords.length ** 2 / (divideBy * (maxLives > 0 ? maxLives : 1))}
            verseLength={verse.length}
            divideBy={divideBy}
          />
          <div className="flex flex-col items-center justify-start gap-4">
            <VerseControls
              divideBy={divideBy}
              setDivideBy={setDivideBy}
              verseLength={verse.length}
              reset={reset}
              maxLives={maxLives}
              onMaxLivesChange={(value) => {
                useLocalStorage.setState((state) => ({ ...state, maxLives: value }));
                setLives(value);
                reset();
              }}
              show={show}
              setShow={setShow}
              penaltyFunc={penaltyFunc}
              verseCompleted={verseCompleted}
              currentScore={useLocalStorage.getState().currentVerse.score}
              onResetClick={() => {
                if (verseCompleted) {
                  setOpenDailyGoals(true);
                  return;
                }
                if (confirm("are you sure you want to reset your progress for this verse?")) redo();
              }}
            />
            {/* verse */}
            {verse_key === null ? (
              <>no surah is selected</>
            ) : (
              <>
                {show && verse && (
                  <motion.div
                    transition={{ duration: 0.25 }}
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    exit={{ y: -20 }}
                    layout
                    dir="rtl"
                    className="text-2xl md:text-3xl"
                  >
                    <Verse
                      {...{
                        verse,
                        highlightIndex: order == "frequency" ? Number(verse_key?.split(":")[2]) - 1 : undefined,
                      }}
                    ></Verse>
                  </motion.div>
                )}
                <VerseInfo {...{ verse_key, verse }} />
                <UserWordsRow userWords={userWords} verse_key={verse_key} />
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
                <WordBank
                  divisions={divisions}
                  userWords={userWords}
                  searchTerm={searchTerm}
                  redIndex={redIndex}
                  verseLength={verse.length}
                  onWordClick={onWordClick}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <DailyGoalsDialog
        open={openDailyGoals}
        setOpen={setOpenDailyGoals}
        verse={verse}
        order={order}
        verseCompleted={verseCompleted}
        onRedo={redo}
        onNext={() => {
          setHold(false);
          setOpen(true);
          setNextVerse();
          setShow(false);
          setUserWords([]);
          setLives(maxLives);
          setDivideBy(1);
          setOpenDailyGoals(false);
          useLocalStorage.setState((state) => ({
            currentVerse: { ...state.currentVerse, score: 0 },
          }));
        }}
      />
      {open && <LivesDisplay maxLives={maxLives} lives={lives} />}
    </>
  );

  function onWordClick(word: WORD, i: number) {
    setAudioVerse(undefined); // close audio
    setShow(false); // hide verse

    // handle mistake
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
      // handle normal case

      setUserWords((prev) => [...prev, word]);
      setLives((prev) => (prev + 1 > maxLives ? maxLives : prev + 1));

      if (won) {
        setHold(true);
        toast.success(
          `You earned ${roundToTwo((userWords.length + 1) ** 2 / (divideBy * (maxLives > 0 ? maxLives : 1)))} points!`,
          {},
        );
      }

      // add score
      useOnlineStorage.setState((state) => {
        state.goalRecords.xp.value = state.goalRecords.xp.value + score;
      });
      const currentVerseScore = useLocalStorage.getState().currentVerse.score;
      useLocalStorage.setState((state) => ({
        currentVerse: {
          ...state.currentVerse,
          score: currentVerseScore + score,
        },
      }));
      const verseNowCompletes = currentVerseScore + score >= verse.length ** 2;
      if (verseNowCompletes) {
        useOnlineStorage.setState((state) => {
          state.goalRecords.verse.value = state.goalRecords.verse.value + 1;
          state.goalRecords.word.value = state.goalRecords.word.value + verse.length;
        });
        if (order === "frequency") {
          useOnlineStorage.setState((state) => {
            state.ranks[currentRank[0]] = currentRank[1] + 1;
          });
        } else {
          verse_key &&
            useOnlineStorage.getState().setQuranProgress(+verse_key?.split(":")[0], +verse_key?.split(":")[1]);
          toast.success(`verse mastered!`, { position: "bottom-right" });
        }
      } else if (won && !verseCompleted) {
        toast.message(`Increasing difficulty !!!`, { position: "top-left" });
        setShow(true);

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
        reset();
      }
      if (won || verseNowCompletes) {
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
      audioVerse !== verse_key // if audio is not playing
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
