"use client";
import React, { memo, use, useEffect, useMemo, useState } from "react";
import { DataTable, type LemmaTableData } from "./data-table";
import getLemmaData from "@/utils/getLemmaData";
import { ColumnDef } from "@tanstack/react-table";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import useFont from "@/utils/useFont";
import { cn } from "@/lib/utils";
import CellComponent from "@/components/CellComponent";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Page(props: { params: Promise<{ lemma: string }> }) {
  const params = use(props.params);
  const { lemma } = params;
  const [font] = useFont();
  const miscPreferences = useQuery(api.miscPreferences.get);
  const translation_ids = miscPreferences?.translation_ids ?? [131];
  const [positions, setPositions] = useState<LemmaTableData[]>([]);
  const [lemmaCount, setLemmaCount] = useState<number>(0);

  useEffect(() => {
    getLemmaData(decodeURIComponent(lemma)).then((lemmaEntry) => {
      setPositions(lemmaEntry?.positions.map((position) => ({ position })) ?? []);
      setLemmaCount(lemmaEntry?.count ?? 0);
    });
  }, [lemma]);

  const columns: ColumnDef<LemmaTableData>[] = useMemo(
    () => [
      {
        accessorFn: (originalRow: LemmaTableData) => {
          return originalRow.position;
        },
        id: "verse",
        header: () => <div className="text-center">Verse</div>,
        cell: memo(
          function Cell({ getValue }) {
            return (
              <div className="flex gap-1 flex-col">
                <div className="text-xs text-center text-gray-400">{getValue() as string}</div>
                <CellComponent
                  {...{
                    translation_ids,
                    verse_key: getValue() as `${string}:${string}${string}`,
                  }}
                />
              </div>
            );
          },
          (prev, next) => prev.getValue() == next.getValue(),
        ),
      },
    ],
    [translation_ids],
  );

  return (
    <>
      <div className="m-6 text-center">
        <div className={cn(font?.className, "text-4xl")}>{buckwalterToArabic(decodeURIComponent(lemma))}</div>
        <div className="text-sm text-gray-500">
          {lemmaCount} occurrence{lemmaCount === 1 ? "" : "s"}
        </div>
      </div>
      <DataTable
        {...{
          columns,
          data: positions,
        }}
      />
    </>
  );
}
