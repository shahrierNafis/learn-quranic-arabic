import React from "react";
import Fuse from "fuse.js";

import { cn } from "@/utils/cn";
import Word from "@/components/Word";
import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WORD } from "@/types";

export default function WordBank({
  divisions,
  userWords,
  searchTerm,
  redIndex,
  verseLength,
  onWordClick,
}: {
  divisions: WORD[][];
  userWords: WORD[];
  searchTerm: string;
  redIndex: number | undefined;
  verseLength: number;
  onWordClick: (word: WORD, i: number) => void;
}) {
  if (!divisions.length) {
    // divisions are not loaded yet, show skeletons
    return (
      <MotionDiv dir="rtl" className="flex flex-wrap items-center justify-center w-full gap-4">
        {userWords.length
          ? ""
          : Array(verseLength > 0 ? verseLength : 10)
              .fill(1)
              .map((a, i) => {
                const randomWidth = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
                return (
                  <MotionDiv key={i}>
                    <Skeleton style={{ width: `${randomWidth}rem` }} className={`h-12 rounded-md`} />
                  </MotionDiv>
                );
              })}
      </MotionDiv>
    );
  }

  return (
    <>
      {divisions.map((division, i) => {
        const options = {
          includeScore: true,
          // Search in `author` and in `tags` array
          keys: ["text_imlaei", "transliteration.text"],
        };

        const fuse = new Fuse(division, options);

        const result = searchTerm ? fuse.search(searchTerm) : division.map((word) => ({ item: word, score: 1 }));

        const userWordIds = userWords.map((w) => w.index);

        if (division.every((word) => userWordIds.includes(word.index))) {
          return null;
        }

        return (
          <MotionDiv
            key={"division-" + i}
            dir="rtl"
            className={cn(
              "flex flex-wrap items-center justify-center w-full gap-2 p-4 shadow-xl border rounded-md ",
            )}
          >
            {result.map((FuseResult) => {
              const word = FuseResult.item;
              return (
                <MotionDiv
                  className={cn(
                    "border border-transparent rounded-md",
                    userWordIds.includes(word.index) ? "border border-dashed rounded-md" : "",
                  )}
                  key={word.index}
                >
                  <Button
                    style={{
                      visibility: userWordIds.includes(word.index) ? "hidden" : "visible",
                    }}
                    className={cn(
                      " text-2xl md:text-3xl",
                      `${redIndex === i && "border border-input ring ring-red-400"}`,
                    )}
                    variant={redIndex === i ? "destructive" : "outline"}
                    size={"lg"}
                    disabled={userWords.length === verseLength}
                    onClick={() => onWordClick(word, i)}
                  >
                    <Word
                      asChild
                      colorless
                      {...{
                        wordSegments: word.wordSegments,
                        noWordInfo: true,
                        word,
                        size: "lg",
                      }}
                    />
                  </Button>
                </MotionDiv>
              );
            })}
          </MotionDiv>
        );
      })}
    </>
  );
}
