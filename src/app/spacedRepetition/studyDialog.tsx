import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "ts-fsrs";
import Word from "@/components/Word";
import { WORD } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import getVerseWords from "@/utils/getVerseWords";
import Verse from "@/components/Verse";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import AnswerBtns from "./AnswerBtns";
import Translations from "@/components/Translations";
import MotionDiv from "@/components/MotionDiv";
import Link from "@/components/ui/Link";
import getCount from "./getCount";
import deepEqual from "deep-equal";
export default function StudyDialog() {
  const wordList = useOnlineStorage(
    (a) => a.wordList,
    (a, b) => {
      const c = deepEqual(a, b);
      return c;
    },
  );

  const [verse, setVerse] = useState<WORD[]>();
  const [word, setWord] = useState<WORD | null>();
  const [show, setShow] = useState(false);
  const [card, setCard] = useState<Card>();
  const [now, setNow] = useState(Date.now());
  const [toggleSuspend] = useOnlineStorage(useShallow((a) => [a.toggleSuspend]));
  const [currentWordLemma, setCurrentWordLemma] = useState<string>();

  const { newWords, learning, review, relearning } = getCount(wordList);
  useEffect(() => {
    return () => {};
  }, [wordList]);

  // main loop
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    // set Verse, Word and card
    (async () => {
      if (Object.keys(wordList).length === 0) return;

      if (signal.aborted) return;
      const filteredCards = Object.entries(wordList).filter((a) => {
        if (a[1].isSuspended) return false; // skip suspended cards
        if (a[1].card.state === 0) return false; // skip new words
        if (a[1].card.due.getTime() > Date.now()) return false; // skip cards that are not due
        return true;
      });
      if (filteredCards.length === 0) {
        if (signal.aborted) return;
        // if there are no cards that are due
        filteredCards.push(
          ...Object.entries(wordList).filter((a) => {
            if (a[1].isSuspended) return false; // skip suspended cards
            if (a[1].card.state !== 0) return false; // skip cards that are not new
            return true;
          }),
        );
      }
      if (filteredCards.length === 0) {
        if (signal.aborted) return;
        // if there are no new cards also
        filteredCards.push(
          ...Object.entries(wordList).filter((a) => {
            if (a[1].isSuspended) return false; // skip suspended cards
            if (!(a[1].card.state === 1 || a[1].card.state === 3)) return false; // skip cards that are not in the Learning state
            return true;
          }),
        );
      }
      if (filteredCards.length === 0) return; // if there are no cards at all
      if (signal.aborted) return;
      // sort by due date
      const sortedCards = filteredCards.sort(
        (a, b) =>
          a[1].card.state == 0
            ? Math.random() - 0.5 // new cards go randomly
            : a[1].card.due.getTime() - b[1].card.due.getTime(), // otherwise sort by due date
      );
      const currentWord = sortedCards[0];

      const wordIndex = currentWord[1].index as `${string}:${string}:${string}`;
      setCard(currentWord[1].card);
      setCurrentWordLemma(currentWord[0]);

      // fetch verse and word
      const words: WORD[] = [];
      words.push(
        ...(await getVerseWords(wordIndex as `${string}:${string}`, signal)).filter(
          (word) => word.char_type_name == "word",
        ),
      );
      if (signal.aborted) return;
      setVerse(words.filter((word) => word.char_type_name == "word"));
      setWord(words.filter((word) => word.index == wordIndex)[0]);
    })();

    return () => {
      abortController.abort();
    };
  }, [wordList]);

  return (
    <>
      <Dialog>
        <DialogTrigger className="w-fit">
          <Button className="bg-blue-500 hover:bg-blue-600 rounded-full text-white">Study Now</Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col max-w-full w-full h-screen">
          {/* header */}
          <div className="flex flex-col h-full w-full items-center justify-center gap-8 text-2xl md:text-3xl">
            {word ? (
              <MotionDiv>
                <Word
                  {...{
                    wordSegments: word.wordSegments,
                    noWordInfo: true,
                    word,
                    size: "default",
                  }}
                />
              </MotionDiv>
            ) : card === undefined ? (
              <MotionDiv className="text-base text-center">
                No words are due. Go to
                <Link href="/activeRead">
                  <Button size={"sm"} variant={"outline"}>
                    active read page
                  </Button>
                </Link>
                to add new words to your word list.
              </MotionDiv>
            ) : (
              <Skeleton className="w-[10vw] h-[48px] rounded-md" />
            )}
            {/* Answer */}
            {show && (
              <MotionDiv className="text-2xl md:text-3xl">
                <Verse
                  {...{
                    verse,
                    highlightIndex: word ? +word.index.split(":")[2] - 1 : undefined,
                    switchIndex: word ? +word.index.split(":")[2] - 1 : undefined,
                  }}
                ></Verse>
                <Translations
                  {...{ index: `${word?.index.split(":")[0]}:${word?.index.split(":")[1]}` }}
                ></Translations>
              </MotionDiv>
            )}
          </div>
          {/* footer */}
          <div className="flex h-fit w-full flex-col mt-auto justify-center items-center">
            {show ? ( // answer is shown
              <>
                {card && currentWordLemma && (
                  <AnswerBtns
                    {...{
                      card,
                      now,
                      wordLemma: currentWordLemma,
                      onClick: () => {
                        setShow(false);
                        setCard(undefined);
                        setCurrentWordLemma(undefined);
                        setVerse(undefined);
                        setWord(undefined);
                      },
                    }}
                  />
                )}
                <MotionDiv className="flex w-fit absolute left-0 top-0 p-2 *:rounded-full gap-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setShow(false);
                      setNow(Date.now());
                    }}
                  >
                    Hide Answer
                  </Button>{" "}
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      currentWordLemma && toggleSuspend(currentWordLemma);
                    }}
                  >
                    Suspend
                  </Button>
                </MotionDiv>
              </>
            ) : (
              // answer is hidden
              <>
                <MotionDiv className="">
                  <span
                    style={{
                      textDecoration: card?.state === 0 ? "underline" : "none",
                    }}
                    className="text-blue-500"
                  >
                    {newWords}
                  </span>
                  -
                  <span
                    style={{
                      textDecoration: card?.state === 1 ? "underline" : "none",
                    }}
                    className="text-red-500"
                  >
                    {learning}
                  </span>
                  -
                  <span
                    style={{
                      textDecoration: card?.state === 2 ? "underline" : "none",
                    }}
                    className="text-green-500"
                  >
                    {review}
                  </span>
                  -
                  <span
                    style={{
                      textDecoration: card?.state === 3 ? "underline" : "none",
                    }}
                    className="text-yellow-500"
                  >
                    {relearning}
                  </span>
                </MotionDiv>
                <MotionDiv>
                  <Button
                    disabled={card?.state === undefined}
                    variant={"outline"}
                    className="rounded-full"
                    onClick={() => {
                      setShow(true);
                      setNow(Date.now());
                    }}
                  >
                    Show Answer
                  </Button>
                </MotionDiv>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
