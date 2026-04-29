import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Instrument } from "@/features/instruments/api/types";
import { InstrumentSortField, SortOrder } from "@/features/instruments/api/types";
import { useInstrumentsPage } from "@/hooks/use-instruments-page";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  getPercentageColor,
} from "@/lib/utils";

const SORT_OPTIONS: SelectOption[] = [
  { value: InstrumentSortField.Symbol, label: "Symbol" },
  { value: InstrumentSortField.LastPrice, label: "Price" },
  { value: InstrumentSortField.PriceChangePercent24h, label: "24h Change %" },
  { value: InstrumentSortField.Volume24h, label: "24h Volume" },
];

export function InstrumentsPage() {
  const {
    urlState,
    searchInput,
    setSearchInput,
    data,
    isLoading,
    error,
    handleSortChange,
    handleTableSortingChange,
    toggleSortOrder,
    handleInspect,
    goToPage,
    resetUrlState,
    sorting,
  } = useInstrumentsPage();

  const columns: ColumnDef<Instrument>[] = useMemo(
    () => [
      {
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-slate-900">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "lastPrice",
        header: "Last Price",
        cell: ({ getValue }) => (
          <span className="font-mono">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "priceChangePercent24h",
        header: "24h Change",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <span className={`font-mono ${getPercentageColor(value)}`}>
              {formatPercentage(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "volume24h",
        header: "Volume",
        cell: ({ getValue }) => (
          <span className="font-mono">
            {formatCompactNumber(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "high24h",
        header: "High",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono text-slate-600">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "low24h",
        header: "Low",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono text-slate-600">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInspect(row.original.symbol)}
            >
              Inspect
            </Button>
          </div>
        ),
      },
    ],
    [handleInspect],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900">
                SignalScope
              </h1>
              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Instruments
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Trading Instruments
          </h1>
          <p className="mt-2 text-slate-600">
            Browse and analyze cryptocurrency trading pairs
          </p>
        </div>

        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              id="search"
              placeholder="Search instruments (e.g., BTC)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              id="sort"
              options={SORT_OPTIONS}
              value={urlState.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="w-full sm:w-auto"
          >
            {urlState.sortOrder === SortOrder.Asc
              ? "↑ Ascending"
              : "↓ Descending"}
          </Button>

          <Button
            variant="ghost"
            onClick={resetUrlState}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>

        <div className="mb-6">
          <DataTable
            columns={columns}
            data={data?.instruments || []}
            sorting={sorting}
            onSortingChange={handleTableSortingChange}
            isLoading={isLoading}
            error={error?.message || null}
            emptyMessage="No instruments found. Try adjusting your search."
          />
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Page {data.page} of {data.totalPages} ({data.total} total
              instruments)
            </p>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => goToPage(urlState.page - 1)}
                disabled={urlState.page <= 1}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={() => goToPage(urlState.page + 1)}
                disabled={urlState.page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
