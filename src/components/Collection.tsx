import Link from "@/components/ui/Link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import CollectionProgress from "./CollectionProgress";
import PlayBtn from "./PlayBtn";
import getToReviewIds from "@/utils/getToReviewIds";
import { Tables } from "@/database.types";
export default function Collection({
  collection,
  wordGroups,
  progressArr,
}: {
  collection: Tables<"collections">;
  wordGroups: {
    id: number;
    words: string[];
  }[];
  progressArr:
    | {
        progress: number;
        word_group_id: number;
        updated_at: string;
        word_groups: {
          collection_id: number;
          id: number;
        } | null;
      }[]
    | null;
}) {
  const [toReviewCount, setToReviewCount] = useState(0);
  useEffect(() => {
    progressArr &&
      getToReviewIds(progressArr).then((ids) => setToReviewCount(ids.length));

    return () => {};
  }, [progressArr]);

  return (
    <>
      <div className="flex items-center min-w-screen max-w-(--breakpoint-lg) mx-auto">
        <div className="text-3xl hidden md:block">‣</div>
        <div className="p-2 flex m-2 border border-input bg-background justify-around grow">
          <div className="max-w-(--breakpoint-md)">
            <h1 className="text-2xl">{collection.name}</h1>
            <p className="">{collection.description}</p>
          </div>
          <div className="flex grow space-y-2 my-auto flex-col justify-center items-center">
            <CollectionProgress {...{ progressArr, wordGroups }} />
            <div className="flex md:space-x-2 md:space-y-0 space-y-2 flex-col md:flex-row">
              <Link className="flex" href={`/collection/${collection.id}`}>
                <Button className="grow" size={"sm"}>
                  Manage{" "}
                </Button>
              </Link>
              <PlayBtn
                type="play"
                {...{
                  collection_id: collection.id,
                }}
              >
                <Button
                  disabled={
                    (progressArr
                      ? wordGroups.length -
                        progressArr?.filter((p) => p.progress != 0).length
                      : 0) === 0
                  }
                  size={"sm"}
                >
                  Play
                </Button>
              </PlayBtn>

              <PlayBtn
                type="review"
                {...{ collection_id: collection.id, toReviewCount }}
              >
                <Button disabled={toReviewCount === 0} size={"sm"}>
                  Review{" "}
                  {toReviewCount != undefined &&
                    toReviewCount > 0 &&
                    toReviewCount}
                </Button>
              </PlayBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
