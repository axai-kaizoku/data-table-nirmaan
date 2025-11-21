import type { Updater } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import * as React from "react";

export const usePagination = () => {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);

  const pagination = React.useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

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
    [pagination]
  );

  return { page, perPage, pagination, onPaginationChange };
};
