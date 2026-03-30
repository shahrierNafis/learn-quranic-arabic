import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/clients";
import { Database, Tables } from "@/database.types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { Slider } from "./ui/slider";
import { DatePicker } from "./ui/datePicker";

export default function RoundProgress({
  currentProgress,
  setCurrentProgress,
  word_group,
  setCorrect,
  setSelected,
}: {
  word_group: Tables<"word_groups">;
  setCorrect: React.Dispatch<React.SetStateAction<boolean>>;
  currentProgress: number | undefined;
  setCurrentProgress: React.Dispatch<React.SetStateAction<number | undefined>>;
  setSelected: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4 | undefined>>;
}) {
  const [range, setRange] = useState<number[]>([0]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const supabase = createClient<Database>();
  useEffect(() => {
    setRange(currentProgress ? [currentProgress] : [0]);
  }, [currentProgress]);
  async function handleSet(word_group_id: number) {
    if (currentProgress === range[0]) return;
    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        word_group_id,
        progress: range[0],
        updated_at: date ? date.toISOString() : new Date().toISOString(),
      })
      .select();
    if (error) {
      alert(error);
    } else {
      setCorrect(true);
      // setSelected(1);
      setCurrentProgress(range[0]);
    }
  }
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div>
            <Button className="font-bold text-gray-500" variant={"outline"}>
              progress: {currentProgress ?? 0}%
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Progress</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="m-2 flex flex-col justify-center items-center mx-auto">
            Set Progress of selected rows:
            <div className="w-full flex flex-col m-4 gap-8 items-center">
              <Slider
                className="w-[75%] sm:w-full shrink-0 border-primary"
                onValueChange={setRange}
                value={range}
                max={100}
                step={1}
              />
              <DatePicker {...{ date, setDate }} />
              <Button onClick={() => handleSet(word_group.id)}>
                Set {range}%
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
