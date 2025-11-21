import { DataTable } from "@/components/data-table/data-table";
import { DataTableError } from "@/components/data-table/data-table-error";
import { DataTableExportButton } from "@/components/data-table/data-table-export-button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useColumnFilters } from "@/hooks/use-column-filters";
import { useGlobalFilter } from "@/hooks/use-global-filter";
import { usePagination } from "@/hooks/use-pagination";
import { useSorting } from "@/hooks/use-sorting";
import { useTrackData } from "@/hooks/use-track-data";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React from "react";
import { getColumns } from "./columns";

export const Main = () => {
  const columns = React.useMemo(() => getColumns(), []);

  const { page, perPage, pagination, onPaginationChange } = usePagination();
  const { sorting, onSortingChange } = useSorting();
  const { columnFilters, filterValues, onColumnFiltersChange } = useColumnFilters(columns);
  const { globalFilter, searchTerm, setGlobalFilter } = useGlobalFilter();

  const { data, isPending, isFetching, isError, error, refetch } = useTrackData(
    pagination,
    sorting,
    filterValues,
    searchTerm,
    page,
    perPage
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
          cellWidths={["4rem", "30rem", "8rem", "13rem", "6rem", "6rem", "6rem"]}
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
      <DataTableSearch table={table} placeholder="Search by tracks, artists, albums" />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table} isSearchTermFiltered={isSearchTermFiltered}>
          <DataTableExportButton table={table} filename="songs" />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
};
