import MotionDiv from "@/components/MotionDiv";
import { Button } from "@/components/ui/button";
import React from "react";

export default function VerseInfo({ verse, verse_key }: { verse: any[]; verse_key: string | null | undefined }) {
  return (
    <>
      {" "}
      <MotionDiv>
        <Button size={"sm"} className="text-sm" disabled variant={"outline"}>
          {verse.length ? (
            <>
              Verse {verse_key?.split(":")[0] + ":" + verse_key?.split(":")[1]} with length {verse.length}
            </>
          ) : (
            <>loading...</>
          )}
        </Button>
      </MotionDiv>
    </>
  );
}
