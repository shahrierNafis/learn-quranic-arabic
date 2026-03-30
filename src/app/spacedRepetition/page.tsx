"use client";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import React, { useEffect } from "react";
import StudyDialog from "./studyDialog";
import BrowseDialog from "./BrowseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import getCount from "./getCount";

export default function Page() {
  const [wordList] = useOnlineStorage(useShallow((a) => [a.wordList]));
  const [maximumInterval, setMaximumInterval] = useOnlineStorage(useShallow((a) => [a.maximumInterval, a.setMaximumInterval]));
  const { newWords, learning, review, relearning, studiedToday } = getCount(wordList);
  return (
    <div className="w-full flex justify-center gap-32 sm:gap-4 items-center my-auto h-screen  sm:flex-row flex-col ">
      <div className="grid grid-cols-2 justify-items-start gap-2 sm:border-0 border">
        <div>New:</div> <div className="text-blue-500 font-bold">{newWords}</div>
        <div>Learning:</div> <div className="text-red-500 font-bold">{learning}</div>
        <div>To Review:</div> <div className="text-green-500 font-bold">{review}</div>
        <div>Relearning:</div> <div className="text-yellow-500 font-bold">{relearning}</div>
        <div>Studied Today:</div> <div className="font-bold">{studiedToday}</div>
      </div>
      <div className="">
        <div className="flex justify-around gap-4">
          <StudyDialog />
          <BrowseDialog />
        </div>
        <Label>
          Maximum interval
          <Input type="number" value={maximumInterval} onInput={(event) => setMaximumInterval(Math.abs(+event.currentTarget.value))} placeholder="Maximum interval"></Input>
        </Label>
      </div>
    </div>
  );
}
