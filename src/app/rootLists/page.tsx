"use client";
import React from "react";
import Letter from "./Letter";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function Page() {
  const [maxNumOfRoots, setMaxNumOfRoots] = React.useState(10);
  const [sevenColumns, setSevenColumns] = React.useState<boolean>();
  const fsrsData = useQuery(api.fsrs.get);
  const initialize = useMutation(api.fsrs.initialize);

  // Initialize if no data exists
  useEffect(() => {
    if (fsrsData === null) {
      initialize();
    }
  }, [fsrsData, initialize]);

  React.useEffect(() => {
    if (window.innerWidth > window.innerHeight) {
      setSevenColumns(true);
    } else {
      setSevenColumns(false);
    }
  }, []);
  if (!fsrsData) {
    return <div>Loading...</div>;
  }
  return (
    <div className="max-h-screen max-w-screen">
      <div
        dir="rtl"
        className="grid w-full gap-2 p-4"
        style={{
          gridTemplateColumns: `repeat(${sevenColumns ? 7 : 4}, minmax(0, 1fr))`,
        }}
      >
        {arabicAlphabet.map((letter) => (
          <Letter {...{ letter, maxNumOfRoots }} key={letter} />
        ))}
      </div>
    </div>
  );
}
const arabicAlphabet = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
];
