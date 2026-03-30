"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState, use } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import React from "react";
import { Database, Tables } from "@/database.types";
import SetProgress from "./SetProgress";
import { RowSelectionState } from "@tanstack/react-table";
import getCollectionName from "@/utils/getCollectionName";
import { createClient } from "@/utils/supabase/clients";
import CollectionProgress from "@/components/CollectionProgress";
import PlayBtn from "@/components/PlayBtn";
import { Button } from "@/components/ui/button";
export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);

  const { id } = params;

  const [name, setName] = useState<string | null>();
  const [wordGroups, setWordGroups] = useState<Tables<"word_groups">[]>();

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const supabase = createClient<Database>();

  useEffect(() => {
    getCollectionName(+id).then(setName);
    return () => {};
  }, [id]);

  useEffect(() => {
    !wordGroups &&
      supabase
        .rpc("get_word_groups", { collection_id: +id })
        .then(({ data, error }) => {
          if (error) {
            console.log(error);
          } else {
            setWordGroups(data);
          }
        });
  }, [id, supabase, wordGroups]);

  const [progressArr, setProgressArr] = useState<
    | {
        progress: number;
        word_group_id: number;
        updated_at: string;
        word_groups: {
          collection_id: number;
          id: number;
        } | null;
      }[]
    | null
  >([]);

  useEffect(() => {
    supabase
      .from("user_progress")
      .select(
        "progress,word_group_id,updated_at,word_groups(collection_id, id)"
      )
      .then(({ error, data }) => {
        if (error || !data) {
          console.log(error);
        } else {
          setProgressArr(
            data.filter((p) => p.word_groups?.collection_id == +id)
          );
        }
      });
  }, [id, supabase, wordGroups]);
  return (
    <>
      {wordGroups && name ? (
        <>
          <div className="max-w-(--breakpoint-md) mx-auto">
            <div className="text-3xl flex items-center justify-center">
              {name}
            </div>
            <div className="md:w-[25%]">
              <CollectionProgress
                {...{ collection_id: +id, progressArr, wordGroups }}
              />
            </div>
            <div className="rounded-md border ">
              <PlayBtn
                type="play"
                {...{ collection_id: +id }}
                className="float-right my-auto"
              >
                <Button
                  disabled={
                    (progressArr
                      ? wordGroups.length -
                        progressArr?.filter((p) => p.progress != 0).length
                      : 0) === 0
                  }
                  size={"default"}
                >
                  Play
                </Button>
              </PlayBtn>
              <DataTable
                {...{
                  columns,
                  data: wordGroups,
                  rowSelection,
                  setRowSelection,
                }}
              />
            </div>
            <SetProgress {...{ id, rowSelection, wordGroups }} />
          </div>
        </>
      ) : (
        <>
          <LoadingScreen />
        </>
      )}
    </>
  );
}
