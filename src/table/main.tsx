import { getData, type Track } from "@/api/getData";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { exportTableToCSV } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { useQuery, type Updater } from "@tanstack/react-query";
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Download } from "lucide-react";
import React, { useState } from "react";

const DEBOUNCE_MS = 300;

export const Main = () => {
  const columns = React.useMemo<ColumnDef<Track>[]>(
    () => [
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
          label: "Duration",
          variant: "range",
          range: [0, 10],
        },
      },
    ],
    []
  );

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [filterValues, setFilterValues] = useState({});

  const [globalFilter, setGlobalFilter] = useState("");

  const searchTerm = useDebounce(globalFilter, 300);

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
    queryKey: ["data", page, perPage, sorting, filterValues, searchTerm],
    queryFn: async () =>
      await getData({
        ...pagination,
        sorting: sorting as unknown as {
          id: keyof Track;
          desc: boolean;
        }[],
        filters: filterValues,
        searchTerm: searchTerm,
      }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
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
    meta: {
      totalCount: data?.totalCount ?? 0,
    },
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
      globalFilter,
    },
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
    isMultiSortEvent: () => true,
    manualFiltering: true,
    enableGlobalFilter: true,
    manualSorting: true,
    manualPagination: true,
  });

  const isSearchTermFiltered = table.getState()?.globalFilter?.length > 0;

  // Initial loading state (no data yet)
  if (isPending && !data)
    return (
      <div className="p-3 py-5 container mx-auto">
        <DataTableSkeleton
          columnCount={7}
          filterCount={4}
          cellWidths={["8rem", "30rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
          shrinkZero
        />
      </div>
    );

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
    <div className="p-3 py-5 container mx-auto">
      <div className="px-1">
        <Input
          placeholder="Search tracks, artists, albums.."
          className="h-8 mb-1.5"
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
        />
      </div>

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table} isSearchTermFiltered={isSearchTermFiltered}>
          <Button
            variant="outline"
            className="font-normal"
            size="sm"
            disabled={table.getRowCount() === 0}
            onClick={() =>
              exportTableToCSV(table, {
                filename: "songs",
                excludeColumns: ["select", "actions"],
                onlySelected: Object.keys(table.getState().rowSelection).length > 0,
              })
            }
          >
            <Download />
            {Object.keys(table.getState().rowSelection).length > 0 ? (
              <>
                Export Selected
                <div className="text-xs -ml-1">{`(${Object.keys(table.getState().rowSelection).length})`}</div>
              </>
            ) : (
              "Export All"
            )}
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  );
};
