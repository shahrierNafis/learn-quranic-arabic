import React, { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { motion } from "framer-motion";
import SelectChapters from "./SelectChapters";
import AnimationLoop from "./AnimationLoop";
import { useLocalStorage } from "@/stores/localStorage";
import { cn } from "@/lib/utils";
import roundToTwo from "@/utils/roundToTwo";
import EditRanks from "./Rank";
import { ButtonGroup } from "@/components/ui/button-group";

export default function Score({
  noButtons,
  currentScore,
  verseLength,
  divideBy = 1,
  currentRank,
}: {
  noButtons?: boolean;
  currentScore: number;
  verseLength: number;
  divideBy: number;
  currentRank: [number, number];
}) {
  const [score, setScore] = useOnlineStorage(useShallow((state) => [state.ARScore, state.setARScore]));
  const [goal] = useLocalStorage(useShallow((state) => [state.goal]));
  const [currentVerseScore] = useLocalStorage(useShallow((state) => [state.currentVerse.score]));
  const fullScore = verseLength ** 2 / (useLocalStorage.getState().maxLives * divideBy);
  const won = currentScore == fullScore;
  const previousScore = Math.round(score - currentVerseScore) % goal;
  const leveledUp = previousScore + currentScore + currentVerseScore >= goal;
  currentScore = !won ? currentScore : 0;
  const blue = Math.max(0, leveledUp ? (currentVerseScore + previousScore) % goal : currentVerseScore - currentScore);
  const percentageBlue = Math.min(100, (Math.round(blue) / goal) * 100);
  const darkGreen = Math.max(0, leveledUp ? 0 : previousScore);
  const LevelUpped = darkGreen + currentScore >= goal;
  const percentageDarkGreen = LevelUpped ? 0 : Math.min(100, (darkGreen / goal) * 100);
  const gold = LevelUpped ? currentScore - (goal - darkGreen) : currentScore;
  const percentageGold = Math.min(100, (gold / goal) * 100);
  const percentageLightGreen = won ? 0 : Math.min(100, ((fullScore - currentScore) / goal) * 100);
  const [open, setOpen] = useState(false);
  const [order] = useLocalStorage(useShallow((state) => [state.order]));

  if (currentVerseScore > verseLength ** 2) {
  }
  if (blue + darkGreen > goal) {
    //Score exceeds goal! This should not happen.
    // blue = (blue + darkGreen) % goal;
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(o) /* only closes*/}>
      <DialogTrigger className="flex flex-col items-center justify-center w-full px-8 self-start my-8 md:m-0">
        <div onClick={() => setOpen(true)} className="relative w-full text-center font-mono text-sm *:inline">
          Goal{" "}
          <div className={cn(blue || gold ? "text-gray-500" : "font-bold")}>
            {roundToTwo(Math.max(0, (score % goal) - currentVerseScore))}
          </div>
          <div className="text-blue-500">{roundToTwo(blue) > 0 ? "+" + roundToTwo(blue) : ""}</div>
          <div className="text-yellow-600">{gold ? "+" + roundToTwo(gold) : ""}</div>
          {blue || gold ? <div className="font-bold">={roundToTwo(score % goal)}</div> : ""}
          <div>/{goal} XP </div>
          Remaining: <div className="text-green-500">{Math.max(0, Math.round(fullScore - currentScore))}</div>
          <div> XP</div>
        </div>
        <div onClick={() => setOpen(true)} className="w-full h-4 rounded-full bg-zinc-200 relative flex justify-start">
          <motion.div
            className="h-full rounded-full rounded-r-none bg-green-500 flex items-center justify-center shrink-0"
            initial={{ width: percentageDarkGreen + "%" }}
            animate={{
              width: `${percentageDarkGreen}%`,
            }}
          />
          <motion.div
            className="h-full bg-blue-500 flex items-center justify-center shrink-0"
            initial={{ width: `${percentageBlue}%` }}
            animate={{ width: `${percentageBlue}%` }}
          />
          <motion.div
            className="h-full bg-yellow-300 flex items-center justify-center shrink-0"
            initial={{ width: percentageGold + "%" }}
            style={{
              borderTopRightRadius: currentScore !== fullScore ? "0px" : "9999px",
              borderBottomRightRadius: currentScore !== fullScore ? "0px" : "9999px",
              borderTopLeftRadius: LevelUpped ? "9999px" : "0px",
              borderBottomLeftRadius: LevelUpped ? "9999px" : "0px",
            }}
            animate={{
              width: `${percentageGold}%`,
            }}
          />
          <motion.div
            className="h-full rounded-full rounded-l-none bg-green-500/25 flex items-center justify-center shrink"
            initial={{ width: percentageLightGreen + "%" }}
            animate={{
              width: `${percentageLightGreen}%`,
            }}
          ></motion.div>
        </div>
        {noButtons ? (
          ""
        ) : (
          <div className="flex gap-2 items-center justify-center mt-2">
            <AnimationLoop />
            <Button onClick={() => setOpen(true)} className="" variant={"outline"}>
              <div>
                Level{" "}
                {(() => {
                  return Math.floor(score / goal);
                })()}
              </div>
            </Button>
            <ButtonGroup aria-label="Button group">
              <Button
                onClick={() => useLocalStorage.setState(() => ({ order: "frequency" }))}
                className=""
                variant={order === "frequency" ? "secondary" : "outline"}
              >
                <div>Frequency List</div>
              </Button>
              <Button
                onClick={() => useLocalStorage.setState(() => ({ order: "quran" }))}
                className=""
                variant={order === "quran" ? "secondary" : "outline"}
              >
                <div>Quran</div>
              </Button>
            </ButtonGroup>
            <Button disabled={order == "quran"} onClick={() => setOpen(true)} className="" variant={"outline"}>
              <div>Rank {order === "frequency" && currentRank[0]}</div>
            </Button>
            <Button
              variant={"outline"}
              onClick={() => {
                const input = prompt("set goal", goal + "");
                if (input === null) return;
                useLocalStorage.setState(() => ({
                  goal: Number(input),
                }));
              }}
            >
              set Goal
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] flex flex-col  max-h-[80vh]">
        <DialogHeader className="overflow-y-auto">
          <DialogTitle>Progress</DialogTitle>
          {order == "frequency" ? (
            <>
              <EditRanks currentRank={currentRank[0]} />
            </>
          ) : (
            <SelectChapters />
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button>Close</Button>
          </DialogClose>
          <Button
            onClick={() => {
              const input = prompt("set progress", score + "");
              if (input === null) return;
              setScore(Number(input));
              // useLocalStorage.setState((state) => ({
              //   currentVerse: { ...state.currentVerse, score: Number(input) },
              // }));
            }}
          >
            Edit XP: {Math.round(score)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
