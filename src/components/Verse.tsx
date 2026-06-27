import { cn } from "@/lib/utils";
import { WORD } from "@/types";
import React, { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import Word from "./Word";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeftRight, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import VerseAudioBtn from "./verseAudioBtn";

export default function Verse({
  verse,
  highlightIndex,
  hideIndex,
  switchIndex,
  hideAudioPlayer,
  children,
  hideSwitchBtn,
}: {
  verse: WORD[] | undefined;
  highlightIndex?: number;
  hideIndex?: number;
  switchIndex?: number;
  hideAudioPlayer?: boolean;
  children?: ReactNode;
  hideSwitchBtn?: boolean;
}) {
  const [switchOn, setSwitchOn] = useState(false);
  const [showTranslation, showTransliteration, showTranslationOnHiddenWords] = useOnlineStorage(
    useShallow((a) => [a.showTranslation, a.showTransliteration, a.showTranslationOnHiddenWords]),
  );
  useEffect(() => {
    setSwitchOn(false);
  }, [verse]);

  const [surah, ayah] = verse?.length ? verse[0].index.split(":") : ["1", "1"];
  return (
    <>
      <div dir={"rtl"} className="flex justify-center items-center">
        <div
          dir={switchOn ? "ltr" : "rtl"}
          // style={{
          //   display: "grid",
          //   gridAutoFlow: "column",
          //   gridTemplateColumns: "repeat(auto-fill, min-content)",
          //   gridTemplateRows: "repeat(3, min-content)",
          // }}
          className={cn("flex flex-wrap items-center justify-center")}
        >
          {verse ? (
            verse.map((word, index) => {
              if (!word.index) console.log(word);
              if (word.char_type_name !== "word") return "";
              if (index == hideIndex)
                return children ? (
                  <>{children}</>
                ) : (
                  <>
                    <div key={word.index} className="flex flex-col justify-center items-center ">
                      <div className={""}>{"_?_?_?_"}</div>{" "}
                      {showTransliteration && (
                        <div className="dark:text-green-100 text-green-950  text-sm">_ _ _ _</div>
                      )}
                      {showTranslation && (
                        <div className="dark:text-red-100 text-red-950 text-xs justify-self-end">
                          {showTranslationOnHiddenWords ? word.translation.text : <>_ _ _ _</>}
                        </div>
                      )}{" "}
                    </div>
                  </>
                );
              if (switchOn && index != switchIndex) {
                return (
                  <>
                    <div key={word.index} className="flex flex-col justify-center items-center">
                      <div className="dark:text-red-100 text-red-950 p-3">{word.translation.text}</div>
                      {showTransliteration && (
                        <div className="dark:text-green-100 text-green-950 px-0 h-5 text-sm"> </div>
                      )}
                      {showTranslation && <div className="dark:text-red-100 text-red-950 h-4 justify-self-end"> </div>}
                    </div>
                  </>
                );
              }
              return (
                <>
                  <div key={word.index} className={cn("flex flex-col justify-center items-center")}>
                    <div className={cn(index == highlightIndex && "border-2 rounded border-green-500")} dir="rtl">
                      <Word {...{ wordSegments: word.wordSegments, word }} />
                    </div>
                    {showTransliteration && (
                      <div className="dark:text-green-100 text-green-950  text-sm px-1">
                        {word.transliteration.text}
                      </div>
                    )}
                    {showTranslation && (
                      <div className="dark:text-red-100 text-red-950 text-xs px-1">{word.translation.text} </div>
                    )}
                  </div>
                </>
              );
            })
          ) : (
            <>
              <Skeleton className="w-[75vw] h-[45px] rounded-full" />
            </>
          )}
        </div>{" "}
        {verse && !hideSwitchBtn && (
          <Button
            size={"icon"}
            variant={switchOn ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => setSwitchOn(!switchOn)}
          >
            <ArrowLeftRight />
          </Button>
        )}{" "}
        {verse && !hideAudioPlayer && <VerseAudioBtn verse_key={`${surah}:${ayah}`} />}
      </div>
    </>
  );
}
