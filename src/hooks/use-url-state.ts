import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  InstrumentSortField,
  SortOrder,
} from "@/features/instruments/api/types";

type SortBy = InstrumentSortField;

const SORT_PARAM_TO_SORT_BY: Record<string, SortBy> = {
  symbol: InstrumentSortField.Symbol,
  lastPrice: InstrumentSortField.LastPrice,
  changePct24h: InstrumentSortField.PriceChangePercent24h,
  volume: InstrumentSortField.Volume24h,
  // Backward-compatible support for older internal URL values
  priceChangePercent24h: InstrumentSortField.PriceChangePercent24h,
  volume24h: InstrumentSortField.Volume24h,
};

const SORT_BY_TO_SORT_PARAM: Record<SortBy, string> = {
  [InstrumentSortField.Symbol]: "symbol",
  [InstrumentSortField.LastPrice]: "lastPrice",
  [InstrumentSortField.PriceChangePercent24h]: "changePct24h",
  [InstrumentSortField.Volume24h]: "volume",
};

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlState = useMemo(() => {
    return {
      search: searchParams.get("q") || "",
      sortBy:
        SORT_PARAM_TO_SORT_BY[searchParams.get("sort") || ""] ||
        InstrumentSortField.Symbol,
      sortOrder:
        searchParams.get("order") === SortOrder.Desc
          ? SortOrder.Desc
          : SortOrder.Asc,
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "5", 10),
    };
  }, [searchParams]);

  const updateUrlState = useCallback(
    (
      updates: Partial<{
        search: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
        page: number;
        limit: number;
      }>,
    ) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        if (updates.search !== undefined) {
          if (updates.search) {
            newParams.set("q", updates.search);
          } else {
            newParams.delete("q");
          }
        }

        if (updates.sortBy !== undefined) {
          if (updates.sortBy !== InstrumentSortField.Symbol) {
            newParams.set("sort", SORT_BY_TO_SORT_PARAM[updates.sortBy]);
          } else {
            newParams.delete("sort");
          }
        }

        if (updates.sortOrder !== undefined) {
          if (updates.sortOrder !== SortOrder.Asc) {
            newParams.set("order", updates.sortOrder);
          } else {
            newParams.delete("order");
          }
        }

        if (updates.page !== undefined) {
          if (updates.page !== 1) {
            newParams.set("page", updates.page.toString());
          } else {
            newParams.delete("page");
          }
        }

        if (updates.limit !== undefined) {
          if (updates.limit !== 5) {
            newParams.set("limit", updates.limit.toString());
          } else {
            newParams.delete("limit");
          }
        }

        return newParams;
      });
    },
    [setSearchParams],
  );

  const resetUrlState = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const goToPage = useCallback(
    (page: number) => {
      updateUrlState({ page });
    },
    [updateUrlState],
  );

  const updateSearch = useCallback(
    (search: string) => {
      updateUrlState({ search, page: 1 });
    },
    [updateUrlState],
  );

  const updateSort = useCallback(
    (sortBy: SortBy, sortOrder: SortOrder = SortOrder.Asc) => {
      updateUrlState({ sortBy, sortOrder, page: 1 });
    },
    [updateUrlState],
  );

  return {
    urlState,
    updateUrlState,
    resetUrlState,
    goToPage,
    updateSearch,
    updateSort,
  };
}
