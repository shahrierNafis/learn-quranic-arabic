"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import getLemmaDataArr from "./getLemmaDataArr";
import { LemmaData } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import useFont from "@/utils/useFont";
import { Checkbox } from "@/components/ui/checkbox";

const Rank = (props: {}) => {
  const miscPreferences = useQuery(api.miscPreferences.get);
  const updateMiscPreferences = useMutation(api.miscPreferences.update);
  const ranks = miscPreferences?.ranks ?? [0];

  const [lemmaData, setLemmaData] = useState<LemmaData[]>([]);
  const [font] = useFont();
  const [lemmaDataArr, setLemmaDataArr] = useState<LemmaData[]>([]);

  const currentRank: [number, number] = useMemo(() => {
    const c = Math.max(
      lemmaDataArr.findIndex((element, index) => (ranks[index] ?? 0) < element.count && ranks[index] != 10),
      0,
    );
    return [c, ranks[c] ?? 0];
  }, [lemmaDataArr, ranks]);

  useEffect(() => {
    getLemmaDataArr().then((data) => {
      setLemmaData(data);
      setLemmaDataArr(data); // Assuming this should be set too since it's used in currentRank
    });
  }, []);

  const data = useMemo(() => {
    return Array.from(Object.values(lemmaData)).sort((a, b) => a.rank - b.rank);
  }, [lemmaData]);

  const columns = useMemo<ColumnDef<LemmaData, any>[]>(
    () => [
      {
        accessorFn: (row) => row.rank,
        id: "rank",
        header: "Rank",
        cell: (info) => <strong>{info.getValue()}</strong>,
      },
      {
        accessorFn: (row) => row,
        id: "occurrences",
        header: "Occurrences",
        cell: (info) => {
          const lemmaEntry = info.getValue() as LemmaData;
          return `${lemmaEntry.count}`;
        },
      },
      {
        accessorFn: (row) => row.lemma,
        id: "lemma",
        header: "Lemma",
        cell: (info) => (
          <div className="grow-0 flex justify-center">
            <Link target="_blank" href={("/lemma/" + info.getValue()) as string}>
              <Button
                variant={"outline"}
                size={"sm"}
                className={cn(
                  font?.className,
                  "flex gap-2 justify-center items-center align-middle focus:ring hover:ring",
                )}
              >
                <span className="text-3xl">{buckwalterToArabic(info.getValue() as string)}</span>
                <ExternalLink />
              </Button>
            </Link>
          </div>
        ),
      },
      {
        accessorFn: (row) => row,
        id: "progress",
        header: "Progress",
        cell: (info) => {
          const lemmaEntry = info.getValue() as LemmaData;
          const completed = ranks[lemmaEntry.rank - 1] ?? 0;
          const total = Math.min(10, lemmaEntry.count);
          return (
            <div className="flex items-center justify-center gap-2 ">
              <Edit
                className="z-10 hover:cursor-pointer"
                // size={64}
                onClick={() => {
                  const input = prompt("set progress", ranks[lemmaEntry.rank - 1] + "");
                  if (input === null) return;
                  const newRanks = [...ranks];
                  newRanks[lemmaEntry.rank - 1] = Number(input);
                  updateMiscPreferences({ ranks: newRanks });
                }}
              />
              {completed}/{total}
              <Checkbox
                checked={[10, lemmaEntry.count].includes(ranks[lemmaEntry.rank - 1])}
                onCheckedChange={(checked) => {
                  const newRanks = [...ranks];
                  newRanks[lemmaEntry.rank - 1] = checked ? Math.min(10, lemmaEntry.count) : 0;
                  updateMiscPreferences({ ranks: newRanks });
                }}
              />
            </div>
          );
        },
      },
    ],
    [font?.className, ranks, updateMiscPreferences],
  );
  const [pagination, setPagination] = useState(() => ({
    pageSize: 10,
    pageIndex: 0,
  }));
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: 484,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <div className="rounded-md border overflow-y-auto">
      <div className="flex items-center justify-between p-4">
        <DataTablePagination table={table} />
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() => {
              const targetRowIndex = currentRank[0];
              const pageSize = table.getState().pagination.pageSize;
              const pageIndex = Math.floor(targetRowIndex / pageSize);

              setPagination({
                pageIndex,
                pageSize,
              });
            }}
          >
            Goto to current rank
          </Button>
          <Button
            variant={"outline"}
            onClick={() => {
              const newRank = +(prompt("set rank?", currentRank[0].toString()) ?? "0");
              const newRanks = [...ranks];
              for (const lemmaEntry of lemmaData) {
                newRanks[lemmaEntry.rank - 1] = lemmaEntry.rank > newRank ? 0 : Math.min(lemmaEntry.count, 10);
              }
              updateMiscPreferences({ ranks: newRanks });
            }}
          >
            set rank
          </Button>
        </div>
      </div>
      <Table id="dd" className="overflow-y-hidden">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="*:text-center">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="text-center">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
};

export default Rank;
