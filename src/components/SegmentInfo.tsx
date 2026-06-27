import React from "react";
import { WordSegment } from "@/types";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import { useTheme } from "next-themes";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import useFont from "@/utils/useFont";
import { cn } from "@/lib/utils";
import relations from "@/utils/relations";
import Link from "next/link";
import { Button } from "./ui/button";
import { ExternalLink, Highlighter } from "lucide-react";
export default function SegmentInfo({ segment }: { segment: WordSegment }) {
  const [colours, highlightedRoots] = useOnlineStorage(useShallow((a) => [a.colours, a.highlightedRoots]));
  const { theme } = useTheme();
  const [font] = useFont();

  return (
    <>
      <div>
        <div className="text-xl shadow">
          <div
            dir="rtl"
            className={cn("text-2xl", font?.className)}
            style={{
              color: (colours[segment.partOfSpeech] ?? colours.others)[theme == "dark" ? 1 : 0],
            }}
          >
            {buckwalterToArabic(segment.buckwalter)}
          </div>
          {(Object.keys(segment) as Array<keyof typeof segment>).map((property) => {
            if (property == "lemma") {
              return (
                <div key={property} className="">
                  {segment.lemma && (
                    <>
                      <div className="grid grid-cols-2 items-center   align-middle">
                        <div> lemma:</div>
                        <div className={cn("flex items-center gap-2")}>
                          <Link target="_blank" href={"/lemma/" + segment.lemma}>
                            <Button
                              variant={"outline"}
                              size={"sm"}
                              className={cn(
                                font?.className,
                                "flex gap-2 justify-center items-center align-middle focus:ring hover:ring",
                              )}
                            >
                              <div> {buckwalterToArabic(segment.lemma)}</div>
                              <ExternalLink />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }
            if (property == "root") {
              return (
                <div key={property} className="">
                  {segment.root && (
                    <>
                      <div className="grid grid-cols-2 items-center   align-middle">
                        <div> root:</div>
                        <div className={cn("flex items-center gap-2")}>
                          <Link target="_blank" href={"/root/" + segment.root}>
                            <Button
                              variant={"outline"}
                              size={"sm"}
                              className={cn(
                                font?.className,
                                "flex gap-2 justify-center items-center align-middle focus:ring hover:ring",
                              )}
                            >
                              <div> {buckwalterToArabic(segment.root).split("").join(",")}</div>
                              <ExternalLink />
                            </Button>
                          </Link>
                          <Button
                            title="Highlight all words with this root"
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => {
                              useOnlineStorage.setState((state) => {
                                if (state.highlightedRoots.includes(segment.root!)) {
                                  return {
                                    highlightedRoots: state.highlightedRoots.filter((r) => r != segment.root),
                                  };
                                } else {
                                  return { highlightedRoots: [...state.highlightedRoots, segment.root!] };
                                }
                              });
                            }}
                          >
                            <Highlighter className={cn(highlightedRoots.includes(segment.root) && "text-green-500")} />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }

            if (property == "number") {
              return (
                <div key={property} className="">
                  {segment.number && (
                    <>
                      <div className="grid grid-cols-2 items-center   align-middle">
                        <div> number:</div>
                        <div className={cn("inline")}>
                          {segment.number == "D" ? "Dual" : segment.number == "P" ? "Plural" : "Singular"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }
            if (property == "arabic" || property == "arPartOfSpeech" || property == "position") {
              return <></>;
            }
            if (property == "mood") {
              return (
                <div key={property} className="">
                  {segment.mood && (
                    <>
                      <div className="grid grid-cols-2 items-center   align-middle">
                        <div> mood:</div>
                        <div className={cn("inline")}>
                          {segment.mood == "IND" ? "Indicative" : segment.mood == "JUS" ? "Jussive" : "Subjunctive"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }

            return (
              <>
                <div key={property} className="">
                  {segment[property] && (
                    <>
                      <div className="grid grid-cols-2 items-center   align-middle">
                        <div> {property}:</div>
                        <div className={cn("inline")}>{names[segment[property]] ?? segment[property]}</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
}
const names: { [key: string]: string } = {
  ...relations,
  M: "Male",
  F: "Female",
  PERF: "Perfect",
  IMPF: "Imperfect",
  "ACT PCPL": "Active participle",
  "PASS PCPL": "Passive participle",
  VN: "Verbal noun",
  DEF: "Definite",
  INDEF: "Indefinite",
  NOM: "Nominative",
  ACC: "Accusative",
  GEN: "Genitive",
};
