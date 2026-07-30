import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fontNames } from "@/utils/fontNames";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "./button";
import useFont from "@/utils/useFont";

export default function ChangeFont() {
  const displayPreferences = useQuery(api.displayPreferences.get);
  const updateDisplayPreferences = useMutation(api.displayPreferences.update);
  const fontName = displayPreferences?.font ?? "Noto_Sans_Arabic";
  const setFont = (font: string) => updateDisplayPreferences({ font });
  const [font, , googleFont] = useFont();
  return (
    <>
      <Dialog>
        <DialogTrigger className="flex">
          <Button variant={"outline"} className="grow">
            Change Font
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Font</DialogTitle>
            <DialogDescription>
              <div className="overflow-y-scroll max-h-[75vh]">
                {fontNames.map((f) => {
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={f == fontName} onClick={() => setFont(f)} />{" "}
                        <div className="text-xl">{f}</div>
                      </div>
                      <div className={googleFont[f]?.className + " " + "text-2xl md:text-4xl py-8 ml-4"}>
                        لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
                      </div>
                    </>
                  );
                })}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
