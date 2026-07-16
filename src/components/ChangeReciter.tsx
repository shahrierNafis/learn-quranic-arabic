import React, { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";

export default function ChangeReciter() {
  const [open, setOpen] = React.useState(false);
  const [reciter_id, setReciter_id] = useOnlineStorage(useShallow((s) => [s.reciter_id, s.setReciter_id]));
  type Reciter = {
    id: number;
    reciter_id: number;
    name: string;
    translated_name: {
      name: string;
    };
  };
  const [reciters, setReciters] = useState<Reciter[]>([]);
  useEffect(() => {
    fetch("https://api.qurancdn.com/api/qdc/audio/reciters")
      .then((r) => r.json())
      .then((r) =>
        setReciters(
          (r.reciters as Reciter[]).filter(
            (obj1, i, arr) => arr.findIndex((obj2) => obj2.reciter_id === obj1.reciter_id) === i,
          ),
        ),
      );

    return () => {};
  }, []);

  return (
    <>
      <div className="">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className=" w-full justify-between">
              {reciter_id ? reciters.find((reciter) => reciter.id + "" === reciter_id)?.name : "Select reciter..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search reciter..." />
              <CommandList>
                <CommandEmpty>No reciter found.</CommandEmpty>
                <CommandGroup>
                  {reciters.map((reciter) => (
                    <CommandItem
                      key={reciter.id}
                      value={reciter.id + ""}
                      onSelect={(currentValue) => {
                        setReciter_id(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", reciter_id === reciter.id + "" ? "opacity-100" : "opacity-0")}
                      />
                      {reciter.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
