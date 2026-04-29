import { queryOptions, useQuery } from "@tanstack/react-query";
import { instrumentsService } from "../api/service";
import type { InstrumentsFilter, InstrumentsPagination } from "../api/types";

export function getInstrumentsQueryOptions(
  filters: InstrumentsFilter,
  pagination: InstrumentsPagination,
) {
  return queryOptions({
    queryKey: ["instruments", filters, pagination],
    queryFn: () => instrumentsService.list(filters, pagination),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetInstruments(
  filters: InstrumentsFilter,
  pagination: InstrumentsPagination,
) {
  return useQuery(getInstrumentsQueryOptions(filters, pagination));
}
