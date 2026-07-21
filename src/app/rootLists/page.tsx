"use client";
import React from "react";
import Letter from "./Letter";

export default function Page() {
  const [maxNumOfRoots, setMaxNumOfRoots] = React.useState(10);
  const [sevenColumns, setSevenColumns] = React.useState<boolean>();

  React.useEffect(() => {
    if (window.innerWidth > window.innerHeight) {
      setSevenColumns(true);
    } else {
      setSevenColumns(false);
    }
  }, []);

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
