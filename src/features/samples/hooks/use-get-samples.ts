import { queryOptions, useQuery } from "@tanstack/react-query";
import { samplesService } from "../api/service";
import type { SamplesParams } from "../api/types";

const SAMPLES_QUERY_CONFIG = {
  staleTimeMs: 60_000,
  gcTimeMs: 10 * 60 * 1000,
  retryAttempts: 3,
  retryBaseDelayMs: 1_000,
  retryMaxDelayMs: 30_000,
} as const;

export function getSamplesQueryOptions(params: SamplesParams) {
  return queryOptions({
    queryKey: ["samples", params],
    queryFn: () => samplesService.fetch(params),
    staleTime: SAMPLES_QUERY_CONFIG.staleTimeMs,
    gcTime: SAMPLES_QUERY_CONFIG.gcTimeMs,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    retry: SAMPLES_QUERY_CONFIG.retryAttempts,
    retryDelay: (attemptIndex) =>
      Math.min(
        SAMPLES_QUERY_CONFIG.retryBaseDelayMs * 2 ** attemptIndex,
        SAMPLES_QUERY_CONFIG.retryMaxDelayMs,
      ),
  });
}

export function useGetSamples(params: SamplesParams, enabled: boolean = true) {
  return useQuery({
    ...getSamplesQueryOptions(params),
    enabled: enabled && Boolean(params.symbol && params.interval),
  });
}
