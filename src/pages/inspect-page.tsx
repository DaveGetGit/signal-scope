import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useInspectPage } from "@/hooks/use-inspect-page";
import { useInspectAnnotations } from "@/hooks/use-inspect-annotations";
import { useSymbolAnnotations } from "@/stores/annotation-store";
import { useAnnotationMode } from "@/stores/ui-store";
import { AnnotationPopover } from "@/components/charts/annotation-popover";
import { AnnotationSidebar } from "@/components/charts/annotation-sidebar";
import { SignalSelector } from "@/components/charts/signal-selector";
import { DateRangePicker } from "@/components/charts/date-range-picker";

// Chart container dimensions
const CHART_CONTAINER_HEIGHT_PX = 500;
import { Button } from "@/components/ui/button";

const InteractiveChart = lazy(() =>
  import("@/components/charts/interactive-chart").then((module) => ({
    default: module.InteractiveChart,
  })),
);

function ChartFallback() {
  return (
    <div
      className="bg-white rounded-lg border border-slate-200 flex items-center justify-center"
      style={{ height: CHART_CONTAINER_HEIGHT_PX }}
    >
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
        <p className="mt-4 text-sm text-slate-600">Loading chart module...</p>
      </div>
    </div>
  );
}

export function InspectPage() {
  const {
    symbol,
    isValidSymbol,
    signal,
    dateRange,
    updateSignal,
    updateDateRange,
    backHref,
    goBack,
    perfProfile,
  } = useInspectPage();

  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useSymbolAnnotations(symbol, signal);

  const { isAnnotating, setIsAnnotating, toggleAnnotationMode } =
    useAnnotationMode();
  const {
    handleAnnotationCancel,
    handleAnnotationConfirm,
    handleAnnotationModeToggle,
    handleDragSelection,
    popoverState,
  } = useInspectAnnotations({
    createAnnotation,
    isAnnotating,
    redo,
    setIsAnnotating,
    signal,
    toggleAnnotationMode,
    undo,
  });

  const handleVisibleRangeChange = (range: { from: number; to: number }) => {
    updateDateRange(range);
  };

  if (!isValidSymbol) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1
            className="mb-4 text-2xl font-bold"
            style={{ color: "var(--color-danger-600)" }}
          >
            Invalid Symbol
          </h1>
          <p className="text-slate-600 mb-4">No trading symbol provided.</p>
          <Link to="/">
            <Button>← Back to Instruments</Button>
          </Link>
        </div>
      </div>
    );
  }

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
                  to={backHref}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ← Back to Instruments
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {symbol} Analysis
          </h1>
          <p className="mt-2 text-slate-600">
            Interactive chart with signal analysis and time range controls
          </p>
          {perfProfile && (
            <div
              className="mt-4 rounded-lg px-4 py-3"
              style={{
                border: "1px solid var(--status-warning-border)",
                backgroundColor: "var(--status-warning-surface)",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--status-warning-text)" }}
              >
                Performance Mode: {perfProfile.label}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--status-warning-text)" }}
              >
                Synthetic data is active for profiling. Live Binance samples are
                bypassed until you remove the <code>perf</code> query param.
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SignalSelector
              selectedSignal={signal}
              onSignalChange={updateSignal}
            />

            <DateRangePicker
              selectedRange={dateRange}
              onRangeChange={updateDateRange}
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-slate-900">
                  Chart Annotations
                </h3>
                <div className="text-xs text-slate-500">
                  {annotations.length} annotation
                  {annotations.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isAnnotating ? "primary" : "outline"}
                  size="sm"
                  onClick={handleAnnotationModeToggle}
                  className="text-xs"
                >
                  {isAnnotating ? "✓ Annotating" : "📝 Add Annotations"}
                </Button>
              </div>
            </div>

            {isAnnotating && (
              <div
                className="mt-3 rounded-lg p-4 shadow-sm"
                style={{
                  background:
                    "linear-gradient(90deg, var(--status-info-surface), var(--surface-card))",
                  border: "1px solid var(--status-info-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-2 w-2 animate-pulse rounded-full"
                    style={{ backgroundColor: "var(--color-primary-500)" }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--status-info-text)" }}
                  >
                    Annotation Mode Active
                  </p>
                </div>
                <p
                  className="mb-2 text-sm"
                  style={{ color: "var(--status-info-text)" }}
                >
                  <strong>📍 Step 1:</strong> Click and drag across any area on
                  the chart below to select a price range
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--status-info-text)" }}
                >
                  💡 Tip: Your mouse cursor will show a crosshair when hovering
                  over the chart. Press Escape or click "Add Annotations" to
                  exit.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-layout mb-6 gap-6 items-start">
          <div
            className={`relative transition-all duration-200 ${
              isAnnotating ? "rounded-lg shadow-lg ring-2" : ""
            }`}
            style={
              isAnnotating
                ? {
                    ["--tw-ring-color" as string]:
                      "color-mix(in srgb, var(--color-primary-500) 45%, transparent)",
                  }
                : undefined
            }
          >
            <Suspense fallback={<ChartFallback />}>
              <InteractiveChart
                symbol={symbol}
                signal={signal}
                startTime={dateRange.from}
                endTime={dateRange.to}
                height={500}
                enableAnnotations={true}
                isAnnotating={isAnnotating}
                annotations={annotations}
                {...(perfProfile ? { perfProfile } : {})}
                onDragSelection={handleDragSelection}
                onVisibleRangeChange={handleVisibleRangeChange}
              />
            </Suspense>
            {isAnnotating && !popoverState.isVisible && (
              <div
                className="absolute right-4 top-4 z-10 rounded-md px-3 py-2 shadow-sm"
                style={{
                  border: "1px solid var(--status-info-border)",
                  backgroundColor: "var(--status-info-surface)",
                }}
              >
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--status-info-text)" }}
                >
                  🖱️ Drag to select area
                </span>
              </div>
            )}

            <AnnotationPopover
              isVisible={popoverState.isVisible}
              position={popoverState.position}
              selection={
                popoverState.selection ?? {
                  start: { x: 0, y: 0 },
                  end: { x: 0, y: 0 },
                }
              }
              onConfirm={handleAnnotationConfirm}
              onCancel={handleAnnotationCancel}
            />
          </div>

          <AnnotationSidebar
            annotations={annotations}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onUpdate={(id, label) => updateAnnotation(id, { label })}
            onDelete={deleteAnnotation}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Chart Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span style={{ color: "var(--color-primary-600)" }}>📊</span>
              <div>
                <p className="font-medium text-slate-900">Pan & Zoom</p>
                <p className="text-slate-600">Drag to pan, scroll to zoom</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span style={{ color: "var(--color-success-600)" }}>🎯</span>
              <div>
                <p className="font-medium text-slate-900">Crosshair</p>
                <p className="text-slate-600">Hover for precise values</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span style={{ color: "var(--color-annotation-support)" }}>
                ⚡
              </span>
              <div>
                <p className="font-medium text-slate-900">Real-time</p>
                <p className="text-slate-600">Live data from Binance API</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span style={{ color: "var(--color-warning-600)" }}>📝</span>
              <div>
                <p className="font-medium text-slate-900">Annotations</p>
                <p className="text-slate-600">Drag to select and annotate</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={goBack}
              className="w-full sm:w-auto"
            >
              ← Back to Instruments
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
