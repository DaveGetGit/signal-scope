import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetInstruments } from "@/features/instruments/hooks/use-get-instruments";
import { useUrlState } from "@/hooks/use-url-state";
import { useDebounce } from "@/hooks/use-debounce";
import {
  InstrumentSortField,
  SortOrder,
} from "@/features/instruments/api/types";

// Default time range constants
const DEFAULT_TIME_RANGE_DAYS = 30;
const DAYS_TO_MILLISECONDS = 24 * 60 * 60 * 1000;
const DEFAULT_TIME_RANGE_MS = DEFAULT_TIME_RANGE_DAYS * DAYS_TO_MILLISECONDS;

const LAST_INSTRUMENTS_URL_KEY = "signal-scope:last-instruments-url";

export function useInstrumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { urlState, updateSearch, updateSort, goToPage, resetUrlState } =
    useUrlState();

  const [searchDraft, setSearchDraft] = useState({
    value: urlState.search,
    source: urlState.search,
  });
  const searchInput =
    searchDraft.source === urlState.search
      ? searchDraft.value
      : urlState.search;

  const debouncedSearch = useDebounce(searchInput, 250);

  useEffect(() => {
    if (debouncedSearch !== urlState.search) {
      updateSearch(debouncedSearch);
    }
  }, [debouncedSearch, urlState.search, updateSearch]);

  const handleSearchInputChange = useCallback(
    (nextValue: string) => {
      setSearchDraft({
        value: nextValue,
        source: urlState.search,
      });
    },
    [urlState.search],
  );

  const { data, isLoading, error } = useGetInstruments(
    {
      search: urlState.search,
      sortBy: urlState.sortBy,
      sortOrder: urlState.sortOrder,
    },
    {
      page: urlState.page,
      limit: urlState.limit,
    },
  );

  const handleSortChange = (sortBy: string) => {
    updateSort(sortBy as InstrumentSortField, urlState.sortOrder);
  };

  const toggleSortOrder = () => {
    updateSort(
      urlState.sortBy,
      urlState.sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc,
    );
  };

  const handleInspect = useCallback(
    (symbol: string) => {
      const returnTo = `${location.pathname}${location.search}`;
      window.sessionStorage.setItem(LAST_INSTRUMENTS_URL_KEY, returnTo);

      navigate(
        `/instruments/${symbol}?signal=close&from=${Date.now() - DEFAULT_TIME_RANGE_MS}&to=${Date.now()}`,
        {
          state: {
            returnTo,
          },
        },
      );
    },
    [location.pathname, location.search, navigate],
  );

  return {
    urlState,
    searchInput,
    setSearchInput: handleSearchInputChange,
    debouncedSearch,
    data,
    isLoading,
    error,
    handleSortChange,
    toggleSortOrder,
    handleInspect,
    goToPage,
    resetUrlState,
  };
}
