import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import roundToTwo from "@/utils/roundToTwo";

import { EasingFactorSelector } from "../EasingFactorSelector";

export default function VerseControls({
  divideBy,
  setDivideBy,
  verseLength,
  reset,
  maxLives,
  onMaxLivesChange,
  show,
  setShow,
  penaltyFunc,
  verseCompleted,
  currentScore,
  onResetClick,
}: {
  divideBy: number;
  setDivideBy: React.Dispatch<React.SetStateAction<number>>;
  verseLength: number;
  reset: () => void;
  maxLives: number;
  onMaxLivesChange: (value: number) => void;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  penaltyFunc: () => void;
  verseCompleted: boolean;
  currentScore: number;
  onResetClick: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap w-full">
      <EasingFactorSelector
        {...{
          divideBy,
          setDivideBy,
          verseLength,
          onValueChange: () => reset(),
        }}
      />
      <div className="relative w-fit shrink-0">
        <Input
          id="max-lives"
          type="number"
          className="text-right w-36"
          value={maxLives}
          max={verseLength}
          onChange={(e) => {
            const value = +e.target.value > 0 ? +e.target.value : 1;
            onMaxLivesChange(value);
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

      <Button variant={"outline"} onClick={onResetClick}>
        {verseCompleted ? (
          "Continue"
        ) : (
          <>
            Reset Score {roundToTwo(currentScore)}/{verseLength ** 2}
          </>
        )}
      </Button>
      {/* Done Btn */}
    </div>
  );
}
