import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import unTypedRootGroupsByFirstLetter from "@/rootGroupsByFirstLetter.json";
import { arabicToBuckwalter, buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import { RootGroupByFirstLetter } from "../../../quran-word-lists/createRootData";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn, roundByNthPlace } from "@/lib/utils";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { Rating, fsrs, State } from "ts-fsrs";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/shallow";
const rootGroupsByFirstLetter: RootGroupByFirstLetter = unTypedRootGroupsByFirstLetter;

function Letter(props: { letter: string; maxNumOfRoots: number }) {
  const [revel, setRevel] = React.useState<number[]>([]);
  const numOfRoots = Math.min(rootGroupsByFirstLetter[arabicToBuckwalter(props.letter)].length, props.maxNumOfRoots);
  const scheduler = fsrs();
  const [rootGroupsByFirstLetterCards] = useOnlineStorage(useShallow((a) => [a.rootGroupsByFirstLetter]));
  const card = rootGroupsByFirstLetterCards[props.letter];

  const [fiveColumns, setFiveColumns] = React.useState<boolean>();

  React.useEffect(() => {
    if (window.innerWidth > window.innerHeight) {
      setFiveColumns(true);
    } else {
      setFiveColumns(false);
    }
  }, []);
  return (
    <>
      <Dialog>
        <DialogTrigger
          className={cn(
            "flex items-center justify-center sm:text-5xl border aspect-square hover:ring-2",

            card.state !== State.New
              ? card.due.getTime() < Date.now()
                ? Date.now() - card.due.getTime() < 1000 * 60 * 60 * 24
                  ? "border-orange-500"
                  : "border-red-500"
                : "border-green-500"
              : "",
          )}
        >
          {props.letter}
        </DialogTrigger>
        <DialogContent className="min-w-sm  sm:max-w-[80vw] h-[80vh] **:text-3xl sm:**:text-5xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {numOfRoots} roots starting with the letter {'"'}
              {props.letter}
              {'"'}
            </DialogTitle>
          </DialogHeader>
          <div
            className="overflow-auto gap-4 grid p-2 sm:px-24"
            style={{
              gridTemplateColumns: `repeat(${fiveColumns ? 5 : 2}, minmax(0, 1fr))`,
            }}
          >
            {rootGroupsByFirstLetter[arabicToBuckwalter(props.letter)]?.map((rootEntry, index) =>
              index < props.maxNumOfRoots ? (
                <div
                  dir="lte"
                  className={cn(
                    "flex items-center justify-center border aspect-square hover:ring-2 cursor-pointer p-4 text-center",
                  )}
                  key={rootEntry.root}
                  onClick={() =>
                    revel.includes(index)
                      ? setRevel((prev) => prev.filter((e) => e !== index))
                      : setRevel((prev) => [...prev, index])
                  }
                >
                  {revel.includes(index) ? (
                    <>
                      <Link
                        className="hover:text-blue-500 flex items-center"
                        target="_blank"
                        href={"/root/" + rootEntry.root}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {buckwalterToArabic(rootEntry.root)}
                        <ExternalLink className="w-4 h-4" />{" "}
                      </Link>
                    </>
                  ) : (
                    <>{index + 1}</>
                  )}
                </div>
              ) : null,
            )}
          </div>
          <DialogFooter className="flex flex-row flex-wrap sm:justify-center justify-center items-center">
            <div className="text-[1rem]! float-left">
              due:
              {card.state === State.New ? "N/A" : milliSecondsToTime(card.due.getTime() - Date.now())}
            </div>
            {[1, 2, 3, 4].map((key) => {
              const preview = scheduler.repeat(card, new Date());
              return (
                <Button
                  variant={key == 1 ? "destructive" : "outline"}
                  className={"text-[1rem]!"}
                  onClick={() => {
                    useOnlineStorage.setState((state) => {
                      state.rootGroupsByFirstLetter[props.letter] = scheduler.next(card, new Date(), key).card;
                    });
                  }}
                  key={key}
                >
                  {Rating[key]} {milliSecondsToTime(preview[key as 1 | 2 | 3 | 4].card.due.getTime() - Date.now())}
                </Button>
              );
            })}{" "}
            {}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Letter;

function milliSecondsToTime(num: number) {
  if (Math.abs(num) >= 1000 * 60 * 60 * 24 * 30 * 12)
    return `${roundByNthPlace(num / (1000 * 60 * 60 * 24 * 7 * 52), 1)}y`;
  if (Math.abs(num) >= 1000 * 60 * 60 * 24 * 30) return `${roundByNthPlace(num / (1000 * 60 * 60 * 24 * 7 * 52), 1)}d`;
  // if (Math.abs(num) >= 1000 * 60 * 60 * 24 * 7) return `${roundByNthPlace(num / (1000 * 60 * 60 * 24 * 7), 1)}w`;
  if (Math.abs(num) >= 1000 * 60 * 60 * 24) return `${roundByNthPlace(num / (1000 * 60 * 60 * 24), 1)}d`;
  if (Math.abs(num) >= 1000 * 60 * 60) return `${roundByNthPlace(num / (1000 * 60 * 60), 1)}h`;
  if (Math.abs(num) >= 1000 * 60) return `${roundByNthPlace(num / (1000 * 60), 1)}m`;
  if (Math.abs(num) >= 1000) return `${roundByNthPlace(num / 1000, 1)}s`;
  return `${num}ms`;
}
