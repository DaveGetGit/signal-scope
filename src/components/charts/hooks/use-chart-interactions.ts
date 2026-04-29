import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import type ReactEChartsCore from "echarts-for-react/esm/core";
import type { DragSelectionEvent } from "@/types/annotations";
import type { DateRange } from "@/components/charts/date-range-picker";

// UI positioning constants
const CHART_MARGIN_PX = 16; // Matches 1rem spacing used in popover CSS
const POPOVER_VERTICAL_OFFSET_PX = -12; // Positions popover above selection
const POPOVER_VISIBLE_HEIGHT_ESTIMATE_PX = 240;
const DATA_ZOOM_DEBOUNCE_MS = 250;

// Time comparison threshold to prevent unnecessary updates (in milliseconds)
const TIME_CHANGE_THRESHOLD_MS = 1_000;

interface BrushEventParams {
  areas?: Array<{
    brushType: string;
    coordRange: [[number, number], [number, number]];
    range: [number, number];
  }>;
}

interface DataZoomState {
  startValue?: number;
  endValue?: number;
}

interface ChartOptionSnapshot {
  dataZoom?: DataZoomState[];
}

interface UseChartInteractionsArgs {
  chartRef: RefObject<ReactEChartsCore | null>;
  enableAnnotations: boolean;
  endTime: number | undefined;
  isAnnotating: boolean;
  onDragSelection: ((event: DragSelectionEvent) => void) | undefined;
  onVisibleRangeChange: ((range: DateRange) => void) | undefined;
  sampleBounds: { start: number; end: number } | null;
  startTime: number | undefined;
}

export function useChartInteractions({
  chartRef,
  enableAnnotations,
  endTime,
  isAnnotating,
  onDragSelection,
  onVisibleRangeChange,
  sampleBounds,
  startTime,
}: UseChartInteractionsArgs) {
  const dataZoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (!chartInstance || !enableAnnotations) return;

    if (isAnnotating) {
      chartInstance.dispatchAction({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "rect",
          brushMode: "single",
        },
      });
    } else {
      chartInstance.dispatchAction({
        type: "brush",
        areas: [],
      });
    }
  }, [chartRef, enableAnnotations, isAnnotating]);

  useEffect(() => {
    return () => {
      if (dataZoomTimeoutRef.current) {
        clearTimeout(dataZoomTimeoutRef.current);
      }
    };
  }, []);

  const handleBrushEnd = useCallback(
    (params: BrushEventParams) => {
      if (!enableAnnotations || !isAnnotating || !onDragSelection) return;

      const brushComponent = params.areas?.[0];
      if (!brushComponent) return;

      const chartInstance = chartRef.current?.getEchartsInstance();
      if (!chartInstance) return;

      const selection = {
        start: {
          x: brushComponent.coordRange[0][0],
          y: brushComponent.coordRange[1][0],
        },
        end: {
          x: brushComponent.coordRange[0][1],
          y: brushComponent.coordRange[1][1],
        },
      };

      const selectionCenterX = (selection.start.x + selection.end.x) / 2;
      const selectionTopY = Math.max(selection.start.y, selection.end.y);

      const [pixelX, pixelY] = chartInstance.convertToPixel(
        { xAxisIndex: 0, yAxisIndex: 0 },
        [selectionCenterX, selectionTopY],
      ) as [number, number];

      const chartBounds = chartInstance.getDom().getBoundingClientRect();
      const hasRoomAbove =
        pixelY - POPOVER_VISIBLE_HEIGHT_ESTIMATE_PX > CHART_MARGIN_PX;
      const dragEvent: DragSelectionEvent = {
        selection,
        position: {
          x: Math.min(
            Math.max(pixelX, CHART_MARGIN_PX),
            chartBounds.width - CHART_MARGIN_PX,
          ),
          y: hasRoomAbove
            ? Math.max(pixelY + POPOVER_VERTICAL_OFFSET_PX, CHART_MARGIN_PX)
            : Math.min(
                pixelY + Math.abs(POPOVER_VERTICAL_OFFSET_PX),
                chartBounds.height - CHART_MARGIN_PX,
              ),
        },
        placement: hasRoomAbove ? "above" : "below",
      };

      onDragSelection(dragEvent);
      chartInstance.dispatchAction({
        type: "brush",
        areas: [],
      });
    },
    [chartRef, enableAnnotations, isAnnotating, onDragSelection],
  );

  const handleDataZoom = useCallback(() => {
    if (!onVisibleRangeChange) return;

    const chartInstance = chartRef.current?.getEchartsInstance();
    if (!chartInstance) return;

    const option = chartInstance.getOption() as ChartOptionSnapshot;
    const zoomState = option.dataZoom?.find(
      (zoom) =>
        typeof zoom.startValue === "number" &&
        typeof zoom.endValue === "number",
    );

    if (!zoomState) return;

    const { startValue, endValue } = zoomState;
    if (typeof startValue !== "number" || typeof endValue !== "number") {
      return;
    }

    const normalizedStart = Math.round(Math.min(startValue, endValue));
    const normalizedEnd = Math.round(Math.max(startValue, endValue));
    const nextRange: DateRange = {
      from:
        sampleBounds !== null
          ? Math.max(normalizedStart, sampleBounds.start)
          : normalizedStart,
      to:
        sampleBounds !== null
          ? Math.min(normalizedEnd, sampleBounds.end)
          : normalizedEnd,
    };

    if (
      !Number.isFinite(nextRange.from) ||
      !Number.isFinite(nextRange.to) ||
      nextRange.from >= nextRange.to
    ) {
      return;
    }

    if (
      startTime !== undefined &&
      endTime !== undefined &&
      Math.abs(nextRange.from - startTime) < TIME_CHANGE_THRESHOLD_MS &&
      Math.abs(nextRange.to - endTime) < TIME_CHANGE_THRESHOLD_MS
    ) {
      return;
    }

    if (dataZoomTimeoutRef.current) {
      clearTimeout(dataZoomTimeoutRef.current);
    }

    dataZoomTimeoutRef.current = setTimeout(() => {
      onVisibleRangeChange(nextRange);
    }, DATA_ZOOM_DEBOUNCE_MS);
  }, [chartRef, endTime, onVisibleRangeChange, sampleBounds, startTime]);

  const onEvents = useMemo(() => {
    if (!enableAnnotations) return {};

    return {
      brushEnd: handleBrushEnd,
      dataZoom: handleDataZoom,
    };
  }, [enableAnnotations, handleBrushEnd, handleDataZoom]);

  return { onEvents };
}
