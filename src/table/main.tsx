import { getData, type Track } from "@/api/getData";
import { DataTable } from "@/components/data-table/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, type Updater } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
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
        accessorKey: "track_id",
        id: "track_id",
        header: "Id",
        enableColumnFilter: true,
      },
      {
        accessorKey: "track_name",
        id: "track_name",
        header: "Name",
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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const pagination = React.useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

  const { data, isPending } = useQuery({
    queryKey: ["data", page, perPage],
    queryFn: async () => await getData({ ...pagination }),
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
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

  const table = useReactTable({
    data: data?.data ?? [],
    pageCount: data?.pageCount ?? 0,
    columns: columns,
    state: {
      pagination: pagination,
    },
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    manualPagination: true,
  });

  if (isPending) return <DataTableSkeleton />;

  return (
    <div className="p-4">
      <DataTable table={table} />
    </div>
  );
};

function DataTableSkeleton() {
  return <div>Loading..</div>;
}
