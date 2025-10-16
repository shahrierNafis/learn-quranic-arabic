import React, { useState } from "react";
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

export default function Score({ noButtons }: { noButtons?: boolean }) {
  const [score, setScore] = useOnlineStorage(useShallow((state) => [state.ARScore, state.setARScore]));
  const goal = useLocalStorage((state) => state.goal);
  const parentage = Math.min(100, ((score % goal) / goal) * 100);
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(o) /* only closes*/}>
      <DialogTrigger className="flex flex-col items-center justify-center w-full px-8 self-start">
        <div onClick={() => setOpen(true)} className="relative w-full text-center font-mono text-sm">
          Goal {Math.round(score % goal)}/{goal} XP
        </div>
        <div onClick={() => setOpen(true)} className="w-full h-[1rem] rounded-full bg-zinc-200 relative">
          <motion.div
            className="h-full rounded-full bg-green-500 flex items-center justify-center"
            initial={{ width: parentage + "%" }}
            animate={{
              width: `${parentage}%`,
            }}
          />
        </div>
        {noButtons ? (
          ""
        ) : (
          <div className="flex gap-2 items-center justify-center mt-2">
            <AnimationLoop />
            <Button onClick={() => setOpen(true)} className="" variant={"outline"}>
              <div>Level {Math.floor(score / goal)}</div>
            </Button>
            <Button
              variant={"outline"}
              onClick={() => {
                const input = prompt("set goal", goal + "");
                if (input === null) return;
                useLocalStorage.setState(() => ({
                  goal: Number(input),
                }));
                confirm("Change XP accordingly?") &&
                  useOnlineStorage.setState((state) => ({
                    ARScore: (state.ARScore / goal) * Number(input),
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
