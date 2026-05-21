"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { useOnlineStorage } from "@/stores/onlineStorage";
import getLemmaDataArr from "./getLemmaDataArr";
import { LemmaData } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { buckwalterToArabic } from "@/utils/arabic-buckwalter-transliteration";
import { Button } from "@/components/ui/button";

const Rank = (props: { currentRank: number }) => {
  const ranks = useOnlineStorage((state) => state.ranks);
  const [lemmaData, setLemmaData] = useState<LemmaData[]>([]);

  useEffect(() => {
    getLemmaDataArr().then(setLemmaData);
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
        cell: (info) => <span className="text-3xl">{buckwalterToArabic(info.getValue() as string)}</span>,
      },
      {
        accessorFn: (row) => row,
        id: "progress",
        header: "Progress",
        cell: (info) => {
          const lemmaEntry = info.getValue() as LemmaData;
          const completed = ranks[lemmaEntry.rank - 1] ?? 0;
          const total = Math.min(10, lemmaEntry.count);
          return `${completed}/${total}`;
        },
      },
    ],
    [ranks],
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
    <div className="rounded-md border">
      <div className="flex items-center justify-between px-4">
        <DataTablePagination table={table} />
        <Button
          variant={"outline"}
          onClick={() => {
            const targetRowIndex = props.currentRank;
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
      </div>
      <Table className="">
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
