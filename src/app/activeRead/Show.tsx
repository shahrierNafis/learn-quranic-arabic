import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useVerseAudio from "@/components/useVerseAudio";
import Verse from "@/components/Verse";
import { WORD } from "@/types/types";
import { X } from "lucide-react";
import { useState } from "react";
export default function Show({
  verse,
  verse_key,
  onClick,
}: {
  verse: WORD[];
  verse_key: string | null;
  onClick: () => void;
}) {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button {...{ onClick }} variant={"outline"}>
            Read/Listen Verse
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[80%] w-fit">
          <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground h-4 w-4 p-2 m-0">
            <X className="h-4 w-4" />
          </AlertDialogCancel>
          <div dir="rtl" className="flex items-center justify-center text-3xl">
            <Verse {...{ verse }}></Verse>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
