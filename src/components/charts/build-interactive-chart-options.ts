import type { Sample, SamplesResponse } from "@/features/samples/api/types";
import { SignalFormat, type Signal } from "@/features/signals/api/types";
import type { ChartAnnotation } from "@/types/annotations";
import { echartsTheme, withAlpha } from "@/lib/theme";

// Chart configuration constants grouped by purpose
const CHART_STYLE = {
  titleFontSize: 16,
  axisLabelFontSize: 12,
  responsiveTitleFontSize: 14,
  lineWidth: 2,
  borderWidth: 2,
  borderRadius: 4,
  labelDistance: 6,
  labelPadding: [4, 8],
} as const;

const CHART_LAYOUT = {
  gridPadding: "50px",
  gridTop: "60px",
  gridResponsivePadding: "30px",
  dataZoomBottomOffset: 10,
  dataZoomHeight: 20,
} as const;

const CHART_PERFORMANCE = {
  progressiveRenderThreshold: 4_000,
  progressiveThreshold: 8_000,
  animationDurationMs: 300,
} as const;

const CHART_ALPHA = {
  areaFillStart: 0.12,
  areaFillEnd: 0.03,
  annotationFill: 0.25,
  brushOutOfBounds: 0.1,
} as const;

const CHART_BREAKPOINTS = {
  mobile: 768,
} as const;

interface BuildInteractiveChartOptionsArgs {
  annotations: ChartAnnotation[];
  annotationSelectionEnabled: boolean;
  currentSignal: Signal;
  enableAnnotations: boolean;
  isLargeSeries: boolean;
  maxRenderPoints: number;
  samplesData: SamplesResponse;
  signalKey: keyof Pick<Sample, "close" | "volume">;
  symbol: string;
}

export function buildInteractiveChartOptions({
  annotations,
  annotationSelectionEnabled,
  currentSignal,
  enableAnnotations,
  isLargeSeries,
  maxRenderPoints,
  samplesData,
  signalKey,
  symbol,
}: BuildInteractiveChartOptionsArgs) {
  const seriesData = samplesData.samples.map((sample: Sample) => [
    sample.timestamp,
    sample[signalKey],
  ]);

  return {
    title: {
      text: `${symbol} - ${currentSignal.name}`,
      left: "center",
      textStyle: {
        fontSize: CHART_STYLE.titleFontSize,
        fontWeight: "600",
        color: echartsTheme.titleColor,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: echartsTheme.axisLabelColor,
        },
      },
      formatter: (params: Array<{ data: [number, number] }>) => {
        if (!params || !params[0]) return "";

        const [timestamp, value] = params[0].data;
        const date = new Date(timestamp).toLocaleString();
        const formattedValue =
          currentSignal.format === SignalFormat.Currency
            ? `$${value.toLocaleString()}`
            : value.toLocaleString();

        return `
          <div style="font-weight: 500;">${symbol}</div>
          <div>${date}</div>
          <div style="color: ${currentSignal.color};">
            ${currentSignal.name}: ${formattedValue}
          </div>
        `;
      },
    },
    grid: {
      left: CHART_LAYOUT.gridPadding,
      right: CHART_LAYOUT.gridPadding,
      top: CHART_LAYOUT.gridTop,
      bottom: CHART_LAYOUT.gridPadding,
      containLabel: true,
    },
    xAxis: {
      type: "time",
      axisLine: {
        lineStyle: { color: echartsTheme.axisLineColor },
      },
      axisLabel: {
        color: echartsTheme.axisLabelColor,
        fontSize: CHART_STYLE.axisLabelFontSize,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: echartsTheme.splitLineColor,
          type: "dashed",
        },
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: {
        lineStyle: { color: echartsTheme.axisLineColor },
      },
      axisLabel: {
        color: echartsTheme.axisLabelColor,
        fontSize: CHART_STYLE.axisLabelFontSize,
        formatter: (value: number) => {
          return currentSignal.format === SignalFormat.Currency
            ? `$${value.toLocaleString()}`
            : value.toLocaleString();
        },
      },
      splitLine: {
        lineStyle: {
          color: echartsTheme.splitLineColor,
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: currentSignal.name,
        type: "line",
        data: seriesData,
        lineStyle: {
          color: currentSignal.color,
          width: CHART_STYLE.lineWidth,
        },
        itemStyle: {
          color: currentSignal.color,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: withAlpha(
                  currentSignal.color,
                  CHART_ALPHA.areaFillStart,
                ),
              },
              {
                offset: 1,
                color: withAlpha(currentSignal.color, CHART_ALPHA.areaFillEnd),
              },
            ],
          },
        },
        smooth: !isLargeSeries,
        symbol: "none",
        sampling: "lttb",
        large: isLargeSeries,
        largeThreshold: maxRenderPoints,
        progressive: CHART_PERFORMANCE.progressiveRenderThreshold,
        progressiveThreshold: CHART_PERFORMANCE.progressiveThreshold,
        emphasis: {
          focus: "series",
        },
        markArea: {
          silent: false,
          data: annotations.map((annotation) => [
            {
              name: annotation.label,
              xAxis: annotation.selection.start.x,
              yAxis: annotation.selection.start.y,
              itemStyle: {
                color: withAlpha(annotation.color, CHART_ALPHA.annotationFill),
                borderColor: annotation.color,
                borderWidth: CHART_STYLE.borderWidth,
              },
              label: {
                show: true,
                position: "top",
                formatter: annotation.label,
                color: echartsTheme.annotationLabelColor,
                fontWeight: "500",
                backgroundColor: echartsTheme.annotationLabelBackground,
                borderColor: echartsTheme.annotationLabelBorderColor,
                borderWidth: 1,
                padding: CHART_STYLE.labelPadding,
                borderRadius: CHART_STYLE.borderRadius,
                distance: CHART_STYLE.labelDistance,
              },
            },
            {
              xAxis: annotation.selection.end.x,
              yAxis: annotation.selection.end.y,
            },
          ]),
        },
      },
    ],
    ...(enableAnnotations && annotationSelectionEnabled
      ? {
          brush: {
            toolbox: ["rect"],
            xAxisIndex: 0,
            yAxisIndex: 0,
            brushLink: "all",
            outOfBrush: {
              colorAlpha: CHART_ALPHA.brushOutOfBounds,
            },
            brushStyle: {
              borderWidth: CHART_STYLE.borderWidth,
              color: echartsTheme.brushFillColor,
              borderColor: echartsTheme.brushBorderColor,
            },
            brushMode: "rect",
            transformable: true,
            removeOnClick: true,
          },
        }
      : {}),
    dataZoom: [
      ...(annotationSelectionEnabled
        ? []
        : [
            {
              type: "inside",
              xAxisIndex: 0,
              filterMode: "none",
            },
          ]),
      ...(annotationSelectionEnabled
        ? [
            {
              type: "inside",
              xAxisIndex: 0,
              filterMode: "none",
              zoomOnMouseWheel: true,
              moveOnMouseMove: false,
              moveOnMouseWheel: false,
            },
          ]
        : []),
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: CHART_LAYOUT.dataZoomBottomOffset,
        height: CHART_LAYOUT.dataZoomHeight,
        borderColor: echartsTheme.axisLineColor,
        fillerColor: withAlpha(currentSignal.color, CHART_ALPHA.areaFillStart),
        handleStyle: {
          color: currentSignal.color,
        },
      },
    ],
    animation: !isLargeSeries,
    animationDuration: isLargeSeries
      ? 0
      : CHART_PERFORMANCE.animationDurationMs,
    media: [
      {
        query: { maxWidth: CHART_BREAKPOINTS.mobile },
        option: {
          grid: {
            left: CHART_LAYOUT.gridResponsivePadding,
            right: CHART_LAYOUT.gridResponsivePadding,
          },
          title: {
            textStyle: { fontSize: CHART_STYLE.responsiveTitleFontSize },
          },
        },
      },
    ],
  };
}
