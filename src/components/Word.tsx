import { WORD, WordData } from "@/types/types";
import React from "react";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import { useTheme } from "next-themes";
import useFont from "@/utils/useFont";
import WordInfo from "./WordInfo";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import { cn } from "@/lib/utils";

function Word({
  wordSegments,
  noWordInfo,
  word,
  size,
  pronounceOnClick,
  asChild = false,
  colorless,
}: {
  wordSegments: WordData;
  noWordInfo?: boolean;
  word?: WORD;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  pronounceOnClick?: boolean;
  asChild?: boolean;
  colorless?: boolean;
}) {
  const [colours, highlightedRoots] = useOnlineStorage(useShallow((a) => [a.colours, a.highlightedRoots]));

  const { systemTheme, theme } = useTheme();
  const [font] = useFont();
  return (
    <>
      <WordInfo
        {...{
          wordSegments,
          disabled: noWordInfo,
          word,
          size,
          pronounceOnClick,
          asChild,
        }}
      >
        <div
          dir="rtl"
          className={cn(
            font?.className,
            "px-2 rounded",
            wordSegments.some((s) => s.root && highlightedRoots.includes(s.root)) &&
              "bg-green-100 dark:bg-green-900/30 rounded",
          )}
        >
          {wordSegments.map((segment, index) => (
            <div
              key={segment.position + ":" + index}
              style={{
                color: colorless
                  ? "inherit"
                  : (colours[segment.partOfSpeech] ?? colours.others)[
                      (theme == "system" ? systemTheme : theme) == "dark" ? 1 : 0
                    ],
              }}
              className="inline"
            >
              {buckwalterToArabic(segment.buckwalter, wordSegments.length - 1 > index, index != 0).trim()}
            </div>
          ))}
        </div>
      </WordInfo>
    </>
  );
}

export default Word;
