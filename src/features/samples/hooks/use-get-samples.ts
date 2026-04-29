import { queryOptions, useQuery } from "@tanstack/react-query";
import { samplesService } from "../api/service";
import type { SamplesParams } from "../api/types";

export function getSamplesQueryOptions(params: SamplesParams) {
  return queryOptions({
    queryKey: ["samples", params],
    queryFn: () => samplesService.fetch(params),
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetSamples(params: SamplesParams, enabled: boolean = true) {
  return useQuery({
    ...getSamplesQueryOptions(params),
    enabled: enabled && Boolean(params.symbol && params.interval),
  });
}
