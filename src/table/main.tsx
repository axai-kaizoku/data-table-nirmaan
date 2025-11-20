import { getData, type Track } from "@/api/getData";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, type Updater } from "@tanstack/react-query";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import React, { useState } from "react";

export const Main = () => {
  const columns = React.useMemo<ColumnDef<Track>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "track_name",
        id: "track_name",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Name
              <ArrowUpDown />
            </Button>
          );
        },
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
      {
        accessorKey: "valence",
        id: "valence",
        header: "Valence",
      },
    ],
    []
  );

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination = React.useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["data", page, perPage, sorting],
    queryFn: async () =>
      await getData({
        ...pagination,
        sorting: sorting as unknown as {
          id: keyof Track;
          desc: boolean;
        }[],
      }),
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    retry: 2,
    retryDelay: 1000,
  });

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState, PaginationState>) => {
      if (typeof updaterOrValue === "function") {
        const newPagination = updaterOrValue(pagination);
        void setPage(newPagination.pageIndex + 1);
        void setPerPage(newPagination.pageSize);
      } else {
        void setPage(updaterOrValue.pageIndex + 1);
        void setPerPage(updaterOrValue.pageSize);
      }
    },
    [pagination, setPage, setPerPage]
  );

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState, SortingState>) => {
      if (typeof updaterOrValue === "function") {
        const newSorting = updaterOrValue(sorting);
        setSorting(newSorting);
      } else {
        setSorting(updaterOrValue);
      }
    },
    [sorting, setSorting]
  );

  const table = useReactTable({
    data: data?.data ?? [],
    pageCount: data?.pageCount ?? 0,
    columns: columns,
    initialState: {
      sorting: [{ id: "track_album_release_date", desc: false }],
    },
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    manualSorting: true,
    manualPagination: true,
    getRowId: (row) => row.track_id,
  });

  // Initial loading state (no data yet)
  if (isPending && !data) return <DataTableSkeleton />;

  // Error state with retry option
  if (isError && !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-center">
          <h3 className="font-semibold text-lg">Failed to load data</h3>
          <p className="text-muted-foreground text-sm">{error?.message || "Something went wrong"}</p>
        </div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DataTable table={table} isFetching={isFetching} />
    </div>
  );
};

function DataTableSkeleton() {
  return <div>Loading..</div>;
}
