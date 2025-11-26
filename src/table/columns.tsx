import { type Track } from "@/api/getData";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import type { DataTableRowAction } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { AudioLines, Clock4, MoreHorizontal } from "lucide-react";

export function getColumns({ setRowAction }: { setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Track> | null>> }): ColumnDef<Track>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="p-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-0.5"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="p-2">
          <Checkbox
            checked={row.getIsSelected()}
            className="translate-y-0.5"
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "track_name",
      id: "track_name",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} label="Track Name" />;
      },
      enableColumnFilter: true,
      enableGlobalFilter: true,
      meta: {
        label: "Track Name",
        placeholder: "Search track names..",
        variant: "text",
      },
    },
    {
      accessorKey: "track_artist",
      id: "track_artist",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} label="Artist" />;
      },
      enableGlobalFilter: true,
      meta: {
        label: "Track Artist",
      },
    },
    {
      accessorKey: "track_album_name",
      id: "track_album_name",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} label="Track Album Name" />;
      },
      enableGlobalFilter: true,
      meta: {
        label: "Track Album Name",
      },
    },
    {
      accessorKey: "playlist_genre",
      id: "playlist_genre",
      header: () => <div className="pr-2">Genre</div>,
      cell: ({ row }) => <div className="capitalize">{row.original.playlist_genre}</div>,
      enableColumnFilter: true,
      meta: {
        variant: "select",
        placeholder: "Search genre",
        label: "Playlist Genre",
        icon: AudioLines,
        options: [
          { label: "Pop", value: "pop" },
          { label: "Rap", value: "rap" },
          { label: "Rock", value: "rock" },
          { label: "Latin", value: "latin" },
          { label: "R&B", value: "r&b" },
          { label: "EDM", value: "edm" },
        ],
      },
    },
    {
      accessorKey: "track_album_release_date",
      id: "track_album_release_date",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} label="Release Date" />;
      },
      cell: ({ cell }) => <div>{formatDate(cell.getValue<Track["track_album_release_date"]>())}</div>,
      enableColumnFilter: true,
      meta: {
        label: "Release Date",
        variant: "dateRange",
      },
    },
    {
      accessorKey: "duration_ms",
      id: "duration_ms",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} label="Duration" />;
      },
      cell: ({ row }) => {
        const duration = row.getValue("duration_ms") as number;
        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, "0")}`;
      },
      enableColumnFilter: true,
      meta: {
        icon: Clock4,
        label: "Duration",
        variant: "range",
        range: [0, 10],
      },
    },
    {
      id: "action",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setRowAction({ row, variant: "update" })
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setRowAction({ row, variant: "delete" })
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
