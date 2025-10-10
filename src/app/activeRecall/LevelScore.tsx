import { motion } from "framer-motion";
import React from "react";

export default function LevelScore({
  score,
  scoreRequired,
  parentage = Math.min(100, (score / scoreRequired) * 100),
}: {
  score: number;
  scoreRequired: number;
  parentage?: number;
}) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full p-8 h-fit self-start">
      <div className="relative w-full text-center font-mono text-sm">
        XP {score} / {scoreRequired}
      </div>
      <div className="w-full h-[1rem] rounded-full bg-zinc-200 relative">
        <motion.div
          className="h-full rounded-full bg-green-500"
          initial={{ width: parentage + "%" }}
          animate={{
            width: `${parentage}%`,
          }}
        ></motion.div>
      </div>
    </div>
  );
}
