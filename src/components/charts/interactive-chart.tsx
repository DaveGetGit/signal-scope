import { useMemo, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/esm/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  AxisPointerComponent,
  BrushComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  MarkAreaComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { SignalType } from "@/features/signals/api/types";
import type { DragSelectionEvent, ChartAnnotation } from "@/types/annotations";
import type { DateRange } from "@/components/charts/date-range-picker";
import type { PerfProfile } from "@/lib/chart-perf-data";
import { useChartSamplesData } from "@/components/charts/hooks/use-chart-samples-data";
import { buildInteractiveChartOptions } from "@/components/charts/build-interactive-chart-options";
import { useChartInteractions } from "@/components/charts/hooks/use-chart-interactions";

// Register only the ECharts pieces the inspect view uses so the chart bundle
// stays isolated to the route and smaller than the full ECharts entry.
echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  AxisPointerComponent,
  GridComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  BrushComponent,
  MarkAreaComponent,
  CanvasRenderer,
]);

export interface ChartProps {
  /** Trading symbol to display */
  symbol: string;
  /** Signal type to show (close or volume) */
  signal: SignalType;
  /** Start timestamp in milliseconds */
  startTime?: number;
  /** End timestamp in milliseconds */
  endTime?: number;
  /** Chart height in pixels */
  height?: number;
  /** Whether annotation mode is enabled */
  enableAnnotations?: boolean;
  /** Whether drag-selection for annotations should be active */
  annotationSelectionEnabled?: boolean;
  /** Whether currently in annotation mode */
  isAnnotating?: boolean;
  /** Array of annotations to display */
  annotations?: ChartAnnotation[];
  /** Optional synthetic perf profile for profiling large datasets */
  perfProfile?: PerfProfile;
  /** Callback when user makes a drag selection for annotation */
  onDragSelection?: (event: DragSelectionEvent) => void;
  /** Callback when visible zoom window changes */
  onVisibleRangeChange?: (range: DateRange) => void;
}

export function InteractiveChart({
  symbol,
  signal,
  startTime,
  endTime,
  height = 400,
  enableAnnotations = false,
  annotationSelectionEnabled = false,
  isAnnotating = false,
  annotations = [],
  perfProfile,
  onDragSelection,
  onVisibleRangeChange,
}: ChartProps) {
  const MAX_RENDER_POINTS = 1_500;
  const chartRef = useRef<ReactEChartsCore>(null);
  const {
    currentSignal,
    error,
    isLargeSeries,
    isLoading,
    sampleBounds,
    samplesData,
  } = useChartSamplesData({
    symbol,
    signal,
    startTime,
    endTime,
    perfProfile,
    maxRenderPoints: MAX_RENDER_POINTS,
  });

  const chartOptions = useMemo(() => {
    if (!samplesData?.samples || !currentSignal) {
      return null;
    }

    return buildInteractiveChartOptions({
      annotations,
      annotationSelectionEnabled,
      currentSignal,
      enableAnnotations,
      isLargeSeries,
      maxRenderPoints: MAX_RENDER_POINTS,
      samplesData,
      signalKey: signal,
      symbol,
    });
  }, [
    annotations,
    annotationSelectionEnabled,
    currentSignal,
    enableAnnotations,
    isLargeSeries,
    samplesData,
    signal,
    symbol,
  ]);

  const { onEvents, onChartReady } = useChartInteractions({
    annotationSelectionEnabled,
    chartRef,
    enableAnnotations,
    endTime,
    onDragSelection,
    onVisibleRangeChange,
    sampleBounds,
    startTime,
  });

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-lg border border-slate-200 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
            style={{ borderColor: "var(--color-primary-500)" }}
          />
          <p className="text-slate-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-white rounded-lg border flex items-center justify-center"
        style={{ height, borderColor: "var(--color-danger-200)" }}
      >
        <div
          className="text-center"
          style={{ color: "var(--color-danger-600)" }}
        >
          <p className="font-medium mb-2">Failed to load chart data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!chartOptions || !samplesData?.samples?.length) {
    return (
      <div
        className="bg-white rounded-lg border border-slate-200 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-slate-600">
          <p className="font-medium mb-2">No data available</p>
          <p className="text-sm">Try adjusting the time range or symbol</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${
        annotationSelectionEnabled || isAnnotating ? "cursor-crosshair" : ""
      }`}
    >
      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={chartOptions}
        style={{
          height: `${height}px`,
          width: "100%",
          cursor:
            annotationSelectionEnabled || isAnnotating
              ? "crosshair"
              : "default",
        }}
        opts={{ renderer: "canvas" }}
        onEvents={onEvents}
        onChartReady={onChartReady}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
