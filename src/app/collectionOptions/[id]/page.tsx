"use client";
import { TableData, columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState, use } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import React from "react";
import { Database, Tables } from "@/database.types";
import { RowSelectionState } from "@tanstack/react-table";
import getCollectionName from "@/utils/getCollectionName";
import { createClient } from "@/utils/supabase/clients";
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

  return (
    <>
      {wordGroups && name ? (
        <>
          <div className="max-w-(--breakpoint-md) mx-auto">
            <div className="text-3xl flex items-center justify-center">
              {name}
            </div>
            <div className="rounded-md border">
              <PlayBtn type="play" className="float-right" {...{ id }}>
                <Button>play</Button>
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
