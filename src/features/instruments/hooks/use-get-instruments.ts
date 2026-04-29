import { queryOptions, useQuery } from "@tanstack/react-query";
import { instrumentsService } from "../api/service";
import type { InstrumentsFilter, InstrumentsPagination } from "../api/types";

const INSTRUMENTS_QUERY_CONFIG = {
  staleTimeMs: 30_000, // 30 seconds
  gcTimeMs: 5 * 60 * 1000, // 5 minutes
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30_000,
  },
  refetch: {
    onWindowFocus: true,
    onReconnect: false,
  },
} as const;

export function getInstrumentsQueryOptions(
  filters: InstrumentsFilter,
  pagination: InstrumentsPagination,
) {
  return queryOptions({
    queryKey: ["instruments", filters, pagination],
    queryFn: () => instrumentsService.list(filters, pagination),
    staleTime: INSTRUMENTS_QUERY_CONFIG.staleTimeMs,
    gcTime: INSTRUMENTS_QUERY_CONFIG.gcTimeMs,
    refetchOnWindowFocus: INSTRUMENTS_QUERY_CONFIG.refetch.onWindowFocus,
    refetchOnReconnect: INSTRUMENTS_QUERY_CONFIG.refetch.onReconnect,
    retry: INSTRUMENTS_QUERY_CONFIG.retry.maxAttempts,
    retryDelay: (attemptIndex) =>
      Math.min(
        INSTRUMENTS_QUERY_CONFIG.retry.baseDelayMs * 2 ** attemptIndex,
        INSTRUMENTS_QUERY_CONFIG.retry.maxDelayMs,
      ),
  });
}

export function useGetInstruments(
  filters: InstrumentsFilter,
  pagination: InstrumentsPagination,
) {
  return useQuery(getInstrumentsQueryOptions(filters, pagination));
}
