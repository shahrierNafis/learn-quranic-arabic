import React from "react";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { WORD } from "@/types";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import DailyGoals from "../DailyGoals";

export default function DailyGoalsDialog({
  open,
  setOpen,
  verse,
  order,
  verseCompleted,
  onRedo,
  onNext,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  verse: WORD[];
  order: string;
  verseCompleted: boolean;
  onRedo: () => void;
  onNext: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-fit min-w-sm  flex flex-col  max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Daily Goals</DialogTitle>
          <DailyGoals
            toAdd={{
              dailyXP: verse.length ** 2,
              dailyFrequencyListVerseCount: order === "frequency" ? 1 : undefined,
              dailyQuranVerseCount: order === "quran" ? 1 : undefined,
              dailyQuranProgressPercentage: order === "quran" ? (verse.length / 77934) * 100 : undefined,
            }}
          />
        </DialogHeader>
        <DialogFooter className="flex items-center sm:justify-center align-middle gap-2">
          <DialogClose>
            <Button variant={"outline"}>Return</Button>
          </DialogClose>
          <Button
            className={cn()}
            variant={"outline"}
            onClick={() => {
              onRedo();
              setOpen(false);
            }}
          >
            {"Redo"}
          </Button>
          <Button variant={"outline"} disabled={!verseCompleted} onClick={onNext}>
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
