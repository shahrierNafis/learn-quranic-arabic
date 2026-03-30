import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/shallow";
export default function BrowseDialog() {
  const wordList = useOnlineStorage(useShallow((a) => a.wordList));
  return (
    <>
      <Dialog>
        <DialogTrigger className="w-fit">
          <Button variant={"outline"} className="rounded-full">
            Browse
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-full h-screen overflow-y-auto overflow-x-auto">
          <DataTable columns={columns} data={Object.entries(wordList).map(([lemma, word]) => ({ card: word.card, index: word.index, isSuspended: word.isSuspended, lemma }))} />
        </DialogContent>
      </Dialog>
    </>
  );
  // return (
  //   <>
  //     <Dialog>
  //       <DialogTrigger className="w-fit">
  //         <Button variant={"outline"} className="rounded-full">
  //           Browse
  //         </Button>
  //       </DialogTrigger>
  //       <DialogContent className="w-full max-w-full h-screen overflow-y-auto overflow-x-auto">
  //         {Object.entries(visibleWordList).map(([lemma, word]) => {
  //           const schedulingCards = preconfiguredFsrs.repeat(word.card, word.card.due);

  //           return (
  //             <>
  //               <div key={lemma} className=" min-w-fit *:min-w-8 grid grid-cols-[repeat(7,minmax(32px,1fr))] *:grid-cols-subgrid items-center justify-items-center border-b p-4">
  //                 <div className="text-sm text-gray-500">{word.index}</div>
  //                 <div className="font-bold text-center">{buckwalterToArabic(lemma)}</div>
  //                 <Button
  //                   variant={"outline"}
  //                   className="rounded-full"
  //                   onClick={() => {
  //                     updateCard(lemma, createEmptyCard());
  //                   }}
  //                 >
  //                   Reset
  //                 </Button>
  //                 <Button
  //                   variant={word.isSuspended ? "outline" : "destructive"}
  //                   className="rounded-full"
  //                   onClick={() => {
  //                     useOnlineStorage.getState().toggleSuspend(lemma);
  //                   }}
  //                 >
  //                   {word.isSuspended ? "Unsuspend" : " Suspend "}
  //                 </Button>
  //                 {word.card.state === 0 && <div className="text-blue-500">(new)</div>}
  //                 {word.card.state === 1 && <div className="text-red-500">(learning)</div>}
  //                 {word.card.state === 2 && <div className="text-green-500">(review)</div>}
  //                 {word.card.state === 3 && <div className="text-yellow-500">(relearning)</div>}
  //                 {/* <div>{msToAppropriateUnits(schedulingCards[Rating.Easy as keyof IPreview].card.due.getTime() - Date.now())}</div> */}
  //                 <div className="text-sm text-gray-500">scheduled in {word.card.scheduled_days} day/s</div>
  //                 <AnswerBtns className="w-fit" {...{ schedulingCards, now: word.card.due.getTime(), wordLemma: lemma }} />
  //               </div>
  //             </>
  //           );
  //         })}
  //         <InfiniteScroll hasMore={hasMore} isLoading={loading} next={next} threshold={1}>
  //           {hasMore && <Loader2 className="my-4 h-8 animate-spin" />}
  //         </InfiniteScroll>
  //       </DialogContent>
  //     </Dialog>
  //   </>
  // );
}
