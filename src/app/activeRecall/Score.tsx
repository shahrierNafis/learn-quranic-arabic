import React from "react";
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

export default function Score() {
  const [score, setScore] = useOnlineStorage(useShallow((state) => [state.ARScore, state.setARScore]));
  let pretendScore = score;
  let level = 1;
  const scoreRequired = 1500;
  while (true) {
    if (pretendScore - scoreRequired <= 0) {
      level += 1;
      break;
    }
    pretendScore -= scoreRequired;
    level += 1;
  }
  const parentage = Math.min(100, (pretendScore / scoreRequired) * 100);

  return (
    <Dialog>
      <DialogTrigger className="flex flex-col items-center justify-center w-full px-8 self-start">
        <div className="relative w-full text-center font-mono text-sm">
          XP {Math.round(pretendScore)} / {scoreRequired}
        </div>
        <div className="w-full h-[1rem] rounded-full bg-zinc-200 relative">
          <motion.div
            className="h-full rounded-full bg-green-500 flex items-center justify-center"
            initial={{ width: parentage + "%" }}
            animate={{
              width: `${parentage}%`,
            }}
          ></motion.div>
        </div>
        <Button className="mt-2" variant={"outline"}>
          <div>Level {level - 1}</div>
        </Button>
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
            }}
          >
            Edit XP: {Math.round(score)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
