import { QueryClient } from "@tanstack/react-query";

const HTTP_STATUS = {
  clientErrorStart: 400,
  serverErrorStart: 500,
} as const;

const QUERY_DEFAULTS = {
  maxRetryAttempts: 3,
  retryBaseDelayMs: 1_000,
  retryMaxDelayMs: 30_000,
  staleTimeMs: 30_000,
  gcTimeMs: 5 * 60 * 1_000,
} as const;

const MUTATION_DEFAULTS = {
  maxRetryAttempts: 2,
  retryMaxDelayMs: 10_000,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === "object" && "status" in error) {
          const apiError = error as { status: number };
          if (
            apiError.status >= HTTP_STATUS.clientErrorStart &&
            apiError.status < HTTP_STATUS.serverErrorStart
          ) {
            return false;
          }
        }
        return failureCount < QUERY_DEFAULTS.maxRetryAttempts;
      },
      retryDelay: (attemptIndex) =>
        Math.min(
          QUERY_DEFAULTS.retryBaseDelayMs * 2 ** attemptIndex,
          QUERY_DEFAULTS.retryMaxDelayMs,
        ),
      staleTime: QUERY_DEFAULTS.staleTimeMs,
      gcTime: QUERY_DEFAULTS.gcTimeMs,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: MUTATION_DEFAULTS.maxRetryAttempts,
      retryDelay: (attemptIndex) =>
        Math.min(
          QUERY_DEFAULTS.retryBaseDelayMs * 2 ** attemptIndex,
          MUTATION_DEFAULTS.retryMaxDelayMs,
        ),
    },
  },
});
