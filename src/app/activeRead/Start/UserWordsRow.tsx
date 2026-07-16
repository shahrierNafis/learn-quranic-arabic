import React from "react";

import { cn } from "@/utils/cn";
import Word from "@/components/Word";
import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import { WORD } from "@/types";

export default function UserWordsRow({
  userWords,
  verse_key,
}: {
  userWords: WORD[];
  verse_key: string | null | undefined;
}) {
  return (
    <div dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-2">
      {userWords.map((word) => (
        <MotionDiv key={word.index}>
          <Button
            className={cn("text-2xl md:text-3xl", verse_key === word.index && "border-2 rounded border-green-500")}
            variant={"outline"}
            size={"lg"}
          >
            <Word
              {...{
                wordSegments: word.wordSegments,
                word,
                size: "lg",
              }}
            />
          </Button>
        </MotionDiv>
      ))}
    </div>
  );
}
