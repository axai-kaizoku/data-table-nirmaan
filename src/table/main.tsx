import { getData, type Track } from "@/api/getData";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatDate } from "@/lib/format";
import { useQuery, type Updater } from "@tanstack/react-query";
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";

const DEBOUNCE_MS = 300;
// const THROTTLE_MS = 50;

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
        meta: {
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
      },
      {
        accessorKey: "track_album_name",
        id: "track_album_name",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} label="Track Album Name" />;
        },
      },
      {
        accessorKey: "playlist_genre",
        id: "playlist_genre",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} label="Genre" />;
        },
        cell: ({ row }) => <div className="capitalize">{row.original.playlist_genre}</div>,
        enableColumnFilter: true,
        meta: {
          variant: "multiSelect",
          placeholder: "Search genre",
          label: "Playlist Genre",
          options: [
            { label: "Alternative", value: "Alternative" },
            { label: "Anime", value: "Anime" },
            { label: "Blues", value: "Blues" },
            { label: "Children's Music", value: "Children's Music" },
            { label: "Classical", value: "Classical" },
            { label: "Comedy", value: "comedy" },
            { label: "Country", value: "country" },
            { label: "Dance", value: "dance" },
            { label: "Electronic", value: "electronic" },
            { label: "Hip-Hop", value: "Hip-Hop" },
            { label: "Indie", value: "indie" },
            { label: "Latin", value: "latin" },
            { label: "Movie", value: "movie" },
            { label: "Pop", value: "pop" },
            { label: "R&B", value: "r&b" },
            { label: "Rap", value: "rap" },
            { label: "Reggae", value: "Reggae" },
            { label: "Rock", value: "Rock" },
            { label: "Singer-Songwriter", value: "Singer-Songwriter" },
            { label: "Soundtrack", value: "Soundtrack" },
            { label: "World", value: "World" },
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
          label: "Duration",
          variant: "range",
          range: [0, 10],
        },
      },
    ],
    []
  );

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [filterValues, setFilterValues] = useState({});

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
    void setPage(1);
    void setFilterValues(values);
  }, DEBOUNCE_MS);

  const filterableColumns = React.useMemo(() => {
    return columns.filter((column) => column.enableColumnFilter);
  }, [columns]);

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState, ColumnFiltersState>) => {
      setColumnFilters((prev) => {
        const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;

        const filterUpdates = next.reduce<Record<string, string | string[] | null>>((acc, filter) => {
          if (filterableColumns.find((column) => column.id === filter.id)) {
            acc[filter.id] = filter.value as string | string[];
          }
          return acc;
        }, {});

        for (const prevFilter of prev) {
          if (!next.some((filter) => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null;
          }
        }

        debouncedSetFilterValues(filterUpdates);
        return next;
      });
    },
    [filterableColumns, debouncedSetFilterValues]
  );

  const pagination = React.useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["data", page, perPage, sorting, filterValues],
    queryFn: async () =>
      await getData({
        ...pagination,
        sorting: sorting as unknown as {
          id: keyof Track;
          desc: boolean;
        }[],
        filters: filterValues,
      }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
  console.log({ data });

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
      pagination,
      sorting: [{ id: "track_album_release_date", desc: false }],
    },
    defaultColumn: {
      enableColumnFilter: true,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
    isMultiSortEvent: () => true,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
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
      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}></DataTableToolbar>
      </DataTable>
    </div>
  );
};

function DataTableSkeleton() {
  return <div>Loading..</div>;
}
