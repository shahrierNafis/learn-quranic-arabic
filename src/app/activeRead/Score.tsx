import React, { use, useState } from "react";
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

export default function Score({
  noButtons,
  currentScore,
  verseLength,
  divideBy = 1,
}: {
  noButtons?: boolean;
  currentScore: number;
  verseLength: number;
  divideBy: number;
}) {
  const [score, setScore] = useOnlineStorage(useShallow((state) => [state.ARScore, state.setARScore]));
  const [goal] = useLocalStorage(useShallow((state) => [state.goal]));

  const fullScore = verseLength ** 2 / (useLocalStorage.getState().maxLives * divideBy);
  const won = currentScore == fullScore;
  currentScore = !won ? currentScore : 0;
  const blue = Math.max(0, useLocalStorage.getState().currentVerseScore - currentScore);
  const percentageBlue = Math.min(100, (Math.round(blue) / goal) * 100);
  const darkGreen = (score - currentScore - blue) % goal;
  const LevelUpped = darkGreen + currentScore >= goal;
  const percentageDarkGreen = LevelUpped ? 0 : Math.min(100, (darkGreen / goal) * 100);
  const gold = LevelUpped ? currentScore - (goal - darkGreen) : currentScore;
  const percentageGold = Math.min(100, (gold / goal) * 100);
  const percentageLightGreen = won ? 0 : Math.min(100, ((fullScore - currentScore) / goal) * 100);
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(o) /* only closes*/}>
      <DialogTrigger className="flex flex-col items-center justify-center w-full px-8 self-start my-8 md:m-0">
        <div onClick={() => setOpen(true)} className="relative w-full text-center font-mono text-sm *:inline">
          Goal{" "}
          <div className={cn(blue || gold ? "text-gray-500" : "font-bold")}>
            {roundToTwo((score % goal) - useLocalStorage.getState().currentVerseScore)}
          </div>
          <div className="text-blue-500">{roundToTwo(blue) > 0 ? "+" + roundToTwo(blue) : ""}</div>
          <div className="text-yellow-600">{gold ? "+" + roundToTwo(gold) : ""}</div>
          {blue || gold ? <div className="font-bold">={roundToTwo(score % goal)}</div> : ""}
          <div>/{goal} XP </div>
          Remaining: <div className="text-green-500">{Math.max(0, Math.round(fullScore - currentScore))}</div>
          <div> XP</div>
        </div>
        <div
          onClick={() => setOpen(true)}
          className="w-full h-4 rounded-full bg-zinc-200 relative flex justify-start"
        >
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
            <Button
              variant={"outline"}
              onClick={() => {
                const input = prompt("set goal", goal + "");
                if (input === null) return;
                useLocalStorage.setState(() => ({
                  goal: Number(input),
                }));
                // if (confirm("Change XP accordingly?")) {
                //   useOnlineStorage.setState((state) => {
                //     useLocalStorage.setState(() => ({
                //       lastScore: (state.ARScore / goal) * Number(input),
                //     }));
                //     return {
                //       ARScore: (state.ARScore / goal) * Number(input),
                //     };
                //   });
                // }
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
          <SelectChapters />
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
              useLocalStorage.setState(() => ({
                currentVerseScore: 0,
              }));
            }}
          >
            Edit XP: {Math.round(score)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
