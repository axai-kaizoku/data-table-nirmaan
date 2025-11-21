import type { getColumns } from "@/table/columns";
import type { ColumnFiltersState } from "@tanstack/react-table";
import * as React from "react";
import { useDebouncedCallback } from "./use-debounced-callback";
import type { Updater } from "@tanstack/react-query";

const DEBOUNCE_MS = 300;

export const useColumnFilters = (columns: ReturnType<typeof getColumns>) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [filterValues, setFilterValues] = React.useState<Record<string, string | string[] | null>>({});

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
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

  return { columnFilters, filterValues, onColumnFiltersChange };
};
