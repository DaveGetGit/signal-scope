import { queryOptions, useQuery } from "@tanstack/react-query";
import { signalsService } from "../api/service";

export function getSignalsQueryOptions() {
  return queryOptions({
    queryKey: ["signals"],
    queryFn: () => signalsService.getAll(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGetSignals() {
  return useQuery(getSignalsQueryOptions());
}
