import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Database, Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/clients";

export default function SetProgress({
  id,
  rowSelection,
  wordGroups,
}: {
  id: string;
  wordGroups: Tables<"word_groups">[];
  rowSelection: RowSelectionState;
}) {
  const [range, setRange] = useState<number[]>([0]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const supabase = createClient<Database>();
  async function handleSet() {
    if (Object.keys(rowSelection).length == 0) {
      return; // return if no row is selected
    }
    await supabase.from("user_progress").upsert(
      Object.keys(rowSelection)
        .filter((wordGroupIndex) => !wordGroupIndex.includes(".")) // skip sub rows
        .map((wordGroupIndex) => {
          return {
            word_group_id: wordGroups[+wordGroupIndex].id,
            progress: range[0],
            updated_at: date ? date.toISOString() : new Date().toISOString(),
          };
        })
    );
  }
  return (
    <>
      <div className="m-2 flex flex-col justify-center items-center mx-auto">
        Set Progress of selected rows:
        <div className="w-full flex flex-col gap-8 items-center">
          <Slider
            className="w-[75%] sm:w-[45%] shrink-0 border-primary"
            onValueChange={setRange}
            value={range}
            max={100}
            step={1}
          />
          <DatePicker {...{ date, setDate }} />
          <Button onClick={handleSet}>Set {range}%</Button>
        </div>
      </div>
    </>
  );
}
