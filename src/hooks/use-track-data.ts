import { getData, type Track } from "@/api/getData";
import { useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";

export const useTrackData = (
  pagination: PaginationState,
  sorting: SortingState,
  filterValues: Record<string, string | string[] | null>,
  searchTerm: string,
  page: number,
  perPage: number
) => {
  return useQuery({
    queryKey: ["data", page, perPage, sorting, filterValues, searchTerm],
    queryFn: async () => {
      // Filter out null values before passing to API
      const cleanFilters = Object.entries(filterValues).reduce<Record<string, string | string[]>>(
        (acc, [key, value]) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      return await getData({
        ...pagination,
        sorting: sorting as unknown as {
          id: keyof Track;
          desc: boolean;
        }[],
        filters: cleanFilters,
        searchTerm: searchTerm,
      });
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};
