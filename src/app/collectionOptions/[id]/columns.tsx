"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import getWord from "@/utils/getWord";
import { OPTION, WORD } from "@/types/types";
import { Database, Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/clients";
import Link from "@/components/ui/Link";

import Word from "@/components/Word";
import getOptions from "@/utils/getOptions";
export type TableData = Tables<"word_groups">;

export const columns: ColumnDef<TableData>[] = [
  {
    accessorFn: (originalRow: TableData, index: number) => {
      return originalRow.words[0];
    },
    id: "index",
    header: () => <div className="text-center">Index</div>,
    cell: ({ row, getValue }) => {
      return <>{getValue()}</>;
    },
  },
  {
    accessorFn: (originalRow: TableData, index: number) => {
      return originalRow;
    },
    id: "word",
    header: () => <div className="text-center">word</div>,
    cell: function Cell({ row, getValue }) {
      const [word, setWord] = useState<WORD>();
      const [options, setOptions] = useState<OPTION[]>();
      const index = (getValue() as Tables<"word_groups">)
        .words[0] as `${string}:${string}:${string}`;
      useEffect(() => {
        getWord(index).then(setWord);
      }, [index]);
      useEffect(() => {
        getOptions(getValue() as Tables<"word_groups">).then(setOptions);
        return () => {};
      }, [getValue]);

      return (
        <>
          <div>{(getValue() as Tables<"word_groups">).name}</div>
          <div className="flex text-3xl gap-4 justify-center items-center">
            {word ? (
              <>
                {" "}
                <div className="border">
                  <Word wordSegments={word.wordSegments} />
                </div>
              </>
            ) : (
              <div className="h-9 opacity-50 text-sm">loading...</div>
            )}
            {options
              ? options.map((op) => (
                  <>
                    <div className="border">
                      <Word wordSegments={op.wordSegments} />
                    </div>
                  </>
                ))
              : "loading"}
          </div>
        </>
      );
    },
  },
];
