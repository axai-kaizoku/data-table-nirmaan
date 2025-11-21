import type { Updater } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import * as React from "react";

export const useSorting = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState, SortingState>) => {
      if (typeof updaterOrValue === "function") {
        const newSorting = updaterOrValue(sorting);
        setSorting(newSorting);
      } else {
        setSorting(updaterOrValue);
      }
    },
    [sorting]
  );

  return { sorting, onSortingChange };
};
