import type { Track } from "@/api/getData";
import type { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const DataTable = ({ data }: { data: Track[] }) => {
  const columns = React.useMemo<ColumnDef<Track>[]>(
    () => [
      {
        accessorKey: "track_id",
        id: "track_id",
        header: "Id",
      },
      {
        accessorKey: "track_name",
        header: "Name",

        id: "track_name",
      },
      {
        accessorKey: "track_artist",
        id: "track_artist",
        header: "Artist",
      },
      {
        accessorKey: "playlist_genre",
        id: "playlist_genre",
        header: "Genre",
      },
      {
        accessorKey: "duration_ms",
        id: "duration_ms",
        header: "Duration",
      },

      {
        accessorKey: "track_album_release_date",
        id: "track_album_release_date",
        header: "Release Date",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn("flex w-full flex-col gap-2.5 overflow-auto p-3")}>
      <div className="overflow-hidden rounded-md border">
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
      </div>
    </div>
  );
};
