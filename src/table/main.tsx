import { getData, type Track } from "@/api/getData";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableError } from "@/components/data-table/data-table-error";
import { DataTableExportButton } from "@/components/data-table/data-table-export-button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useQuery, type Updater } from "@tanstack/react-query";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";
import { getColumns } from "./columns";

const DEBOUNCE_MS = 300;

export const Main = () => {
  const columns = React.useMemo(() => getColumns(), []);

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
    return <DataTableError onRetry={refetch} error={error} />;
  }

  return (
    <div className="p-3 py-5 container mx-auto">
      <DataTableSearch table={table} />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table} isSearchTermFiltered={isSearchTermFiltered}>
          <DataTableExportButton table={table} filename="songs" />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
};
