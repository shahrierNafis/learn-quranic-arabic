"use client";
import React, { memo, useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import getSurahData from "./getSurahData";
import CellComponent from "@/components/CellComponent";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Header from "../../Header";

export default function Page(props: { params: Promise<{ surah: number }> }) {
  const params = use(props.params);

  const { surah } = params;

  const router = useRouter();
  const miscPreferences = useQuery(api.miscPreferences.get);
  const translation_ids = miscPreferences?.translation_ids ?? [131];
  const columns: ColumnDef<string>[] = [
    {
      accessorFn: (index) => index,
      header: "Index",
    },
    {
      accessorFn: (index) => index,
      header: "verse",
      cell: memo(
        function Cell({ getValue }) {
          return (
            <>
              {" "}
              <CellComponent
                {...{
                  translation_ids,
                  verse_key: getValue() as `${string}:${string}${string}`,
                }}
              />
            </>
          );
        },
        (prev, next) => prev.getValue() == next.getValue(),
      ),
    },
  ];
  const [data, setData] = useState<string[]>([]);
  useEffect(() => {
    getSurahData(surah).then(setData);
    return () => {};
  }, [surah]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  if (!surah || surah > 114) {
    return <>Error 404</>;
  }
  return (
    <>
      <Header {...{ surah }} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}
