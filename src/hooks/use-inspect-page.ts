import { useMemo, useCallback, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { SignalType } from "@/features/signals/api/types";
import type { DateRange } from "@/components/charts/date-range-picker";
import { PERF_PROFILES } from "@/lib/chart-perf-data";

const LAST_INSTRUMENTS_URL_KEY = "signal-scope:last-instruments-url";

interface InspectPageLocationState {
  returnTo?: string;
}

export function useInspectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [defaultTo] = useState(() => Date.now());
  const locationState = location.state as InspectPageLocationState | null;
  const persistedReturnTo = window.sessionStorage.getItem(LAST_INSTRUMENTS_URL_KEY);
  const backHref = locationState?.returnTo || persistedReturnTo || "/";
  const perfProfile = useMemo(() => {
    const perfParam = searchParams.get("perf");
    if (!perfParam) {
      return null;
    }

    return PERF_PROFILES[perfParam as keyof typeof PERF_PROFILES] ?? null;
  }, [searchParams]);

  const signal = useMemo((): SignalType => {
    const signalParam = searchParams.get("signal");
    return signalParam === SignalType.Close || signalParam === SignalType.Volume
      ? signalParam
      : SignalType.Close;
  }, [searchParams]);

  const dateRange = useMemo((): DateRange => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = fromParam ? Number(fromParam) : null;
    const to = toParam ? Number(toParam) : null;

    if (!from || !to || isNaN(from) || isNaN(to)) {
      return {
        from: defaultTo - 30 * 24 * 60 * 60 * 1000,
        to: defaultTo,
      };
    }

    return { from, to };
  }, [defaultTo, searchParams]);

  const updateSignal = useCallback(
    (newSignal: SignalType) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("signal", newSignal);
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updateDateRange = useCallback(
    (newRange: DateRange) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("from", newRange.from.toString());
      newParams.set("to", newRange.to.toString());
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const goBack = useCallback(() => {
    navigate(backHref);
  }, [backHref, navigate]);

  const isValidSymbol = Boolean(symbol && symbol.length > 0);

  return {
    symbol: symbol || "",
    isValidSymbol,
    signal,
    dateRange,
    updateSignal,
    updateDateRange,
    backHref,
    goBack,
    perfProfile,
  };
}
