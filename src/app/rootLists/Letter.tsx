import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import unTypedRootGroupsByFirstLetter from "@/quran-data/rootGroupsByFirstLetter.json";
import { arabicToBuckwalter as a2b, buckwalterToArabic as b2a } from "@/utils/arabic-buckwalter-transliteration";
import { RootGroupByFirstLetter } from "@/quran-data/createRootData";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn, roundByNthPlace } from "@/lib/utils";
import { Rating, fsrs, State, Card } from "ts-fsrs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Infer } from "convex/values";
import { RootGroupSchema } from "@/convex/fsrs";
import _ from "lodash";
import { createEmptyCard } from "ts-fsrs";
const rootGroupsByFirstLetter: RootGroupByFirstLetter = unTypedRootGroupsByFirstLetter;
// Helper to convert stored data to FSRS Card
function storedCardToFSRS(cardData: Infer<typeof RootGroupSchema>[string]): Card {
  return {
    ...cardData,
    due: new Date(cardData.due),
    last_review: cardData.last_review ? new Date(cardData.last_review) : undefined,
  };
}
// Helper to convert FSRS Card to stored format
function fSRSToStoredCard(card: Card): Infer<typeof RootGroupSchema>[string] {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review ? card.last_review.getTime() : null,
  };
}

function Letter(props: { letter: string; maxNumOfRoots: number }) {
  const [revel, setRevel] = React.useState<number[]>([]);
  const [fiveColumns, setFiveColumns] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState(false);

  const numOfRoots = Math.min(rootGroupsByFirstLetter[a2b(props.letter)]?.length || 0, props.maxNumOfRoots);

  const scheduler = fsrs();
  const fsrsData = useQuery(api.fsrs.get);
  const updateFsrs = useMutation(api.fsrs.update);

  // Find the card data for this letter from the array
  const letterData = Object.entries(fsrsData?.rootGroupsByFirstLetter ?? {}).find(
    ([letter]) => letter === a2b(props.letter),
  )?.[1] as Infer<typeof RootGroupSchema>[string];

  // Get the card data or create initial if not found
  const card = letterData || createEmptyCard();

  // Convert stored data to FSRS Card for use in the component

  React.useEffect(() => {
    const handleResize = () => {
      setFiveColumns(window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRating = async (rating: number) => {
    if (!fsrsData?.rootGroupsByFirstLetter) return;

    const now = new Date();
    // Get the next card state
    const { card: newCard } = scheduler.next(storedCardToFSRS(card), now, rating);

    // Update the rootGroupsByFirstLetter array
    const updatedRootGroupsByFirstLetter = {
      ...fsrsData.rootGroupsByFirstLetter,
      [a2b(props.letter)]: fSRSToStoredCard(newCard),
    } as Infer<typeof RootGroupSchema>;
    await updateFsrs({
      rootGroupsByFirstLetter: updatedRootGroupsByFirstLetter,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "flex items-center justify-center sm:text-5xl border aspect-square hover:ring-2",
          card.state !== State.New
            ? new Date(card.due).getTime() < Date.now()
              ? Date.now() - new Date(card.due).getTime() < 1000 * 60 * 60 * 24
                ? "border-orange-500"
                : "border-red-500"
              : "border-green-500"
            : "",
        )}
      >
        {props.letter}
      </DialogTrigger>
      <DialogContent className="min-w-sm sm:max-w-[80vw] h-[80vh] **:text-3xl sm:**:text-5xl">
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
          {rootGroupsByFirstLetter[a2b(props.letter)]?.map((rootEntry, index) =>
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
                  <Link
                    className="hover:text-blue-500 flex items-center"
                    target="_blank"
                    href={"/root/" + rootEntry.root}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {b2a(rootEntry.root)}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <>{index + 1}</>
                )}
              </div>
            ) : null,
          )}
        </div>
        <DialogFooter className="flex flex-row flex-wrap sm:justify-center justify-center items-center gap-2">
          <div className="text-[1rem]! float-left">
            due:
            {card.state === State.New ? "N/A" : milliSecondsToTime(new Date(card.due).getTime() - Date.now())}
          </div>
          {[1, 2, 3, 4].map((key) => {
            const preview = scheduler.repeat(storedCardToFSRS(card), new Date());
            return (
              <Button
                variant={key === 1 ? "destructive" : "outline"}
                className={"text-[1rem]!"}
                onClick={() => {
                  handleRating(key);
                  setOpen(false);
                }}
                key={key}
              >
                {Rating[key]} {milliSecondsToTime(preview[key as 1 | 2 | 3 | 4].card.due.getTime() - Date.now())}
              </Button>
            );
          })}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Letter;

function milliSecondsToTime(num: number) {
  if (Math.abs(num) >= 1000 * 60 * 60 * 24 * 30 * 12)
    return `${roundByNthPlace(num / (1000 * 60 * 60 * 24 * 7 * 52), 1)}y`;
  if (Math.abs(num) >= 1000 * 60 * 60 * 24 * 30) return `${roundByNthPlace(num / (1000 * 60 * 60 * 24 * 30), 1)}mo`;
  if (Math.abs(num) >= 1000 * 60 * 60 * 24) return `${roundByNthPlace(num / (1000 * 60 * 60 * 24), 1)}d`;
  if (Math.abs(num) >= 1000 * 60 * 60) return `${roundByNthPlace(num / (1000 * 60 * 60), 1)}h`;
  if (Math.abs(num) >= 1000 * 60) return `${roundByNthPlace(num / (1000 * 60), 1)}m`;
  if (Math.abs(num) >= 1000) return `${roundByNthPlace(num / 1000, 1)}s`;
  return `${num}ms`;
}
