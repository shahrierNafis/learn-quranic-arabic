import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/stores/localStorage";
import { cn, roundByNthPlace } from "@/lib/utils";
import NumberFlow, { continuous } from "@number-flow/react";

export default function Score({
  currentScore,
  verseLength,
  divideBy = 1,
}: {
  currentScore: number;
  verseLength: number;
  divideBy: number;
}) {
  const [currentVerseScore] = useLocalStorage(useShallow((state) => [state.currentVerse.score]));
  const currentDifficultyFullScore = verseLength ** 2 / (useLocalStorage.getState().maxLives * divideBy);
  // const previousScore = Math.round(score - currentVerseScore) % verseLength ** 2;
  const darkGreen = Math.max(0, currentVerseScore);
  const percentageDarkGreen = Math.min(100, (darkGreen / verseLength ** 2) * 100);
  const lightGreen = Math.min(verseLength ** 2 - darkGreen, currentDifficultyFullScore - currentScore);
  const percentageLightGreen = Math.min(100, ((currentDifficultyFullScore - currentScore) / verseLength ** 2) * 100);

  return (
    <div className="flex flex-col items-center justify-center w-full px-8 self-start my-8 md:m-0">
      <div onClick={() => {}} className="relative w-full text-center font-mono text-sm *:inline">
        <div className="text-green-500">
          <NumberFlow plugins={[continuous]} value={roundByNthPlace(darkGreen ?? 0, 1)} />
        </div>
        +
        <div className="text-green-300">
          <NumberFlow plugins={[continuous]} value={roundByNthPlace(lightGreen ?? 0, 1)} />
        </div>
        +
        <div className="text-zinc-200">
          <NumberFlow
            plugins={[continuous]}
            value={roundByNthPlace(verseLength ** 2 - darkGreen - lightGreen, 1) ?? 0}
          />
        </div>
        <div>={verseLength ** 2} </div>XP
      </div>
      <div onClick={() => {}} className="w-full h-4 rounded-full bg-zinc-200 relative flex justify-start">
        <motion.div
          className={cn(
            "h-full rounded-full rounded-r-none bg-green-500 flex items-center justify-center shrink-0",
            currentVerseScore >= verseLength ** 2 && "rounded-full",
          )}
          initial={{ width: percentageDarkGreen + "%" }}
          animate={{
            width: `${percentageDarkGreen}%`,
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
    </div>
  );
}
