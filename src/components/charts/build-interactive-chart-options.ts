import type { Sample, SamplesResponse } from "@/features/samples/api/types";
import { SignalFormat, type Signal } from "@/features/signals/api/types";
import type { ChartAnnotation } from "@/types/annotations";
import { echartsTheme, withAlpha } from "@/lib/theme";

interface BuildInteractiveChartOptionsArgs {
  annotations: ChartAnnotation[];
  currentSignal: Signal;
  enableAnnotations: boolean;
  isAnnotating: boolean;
  isLargeSeries: boolean;
  maxRenderPoints: number;
  samplesData: SamplesResponse;
  signalKey: keyof Pick<Sample, "close" | "volume">;
  symbol: string;
}

export function buildInteractiveChartOptions({
  annotations,
  currentSignal,
  enableAnnotations,
  isAnnotating,
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
        fontSize: 16,
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
      left: "50px",
      right: "50px",
      top: "60px",
      bottom: "50px",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      axisLine: {
        lineStyle: { color: echartsTheme.axisLineColor },
      },
      axisLabel: {
        color: echartsTheme.axisLabelColor,
        fontSize: 12,
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
        fontSize: 12,
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
          width: 2,
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
              { offset: 0, color: withAlpha(currentSignal.color, 0.12) },
              { offset: 1, color: withAlpha(currentSignal.color, 0.03) },
            ],
          },
        },
        smooth: !isLargeSeries,
        symbol: "none",
        sampling: "lttb",
        large: isLargeSeries,
        largeThreshold: maxRenderPoints,
        progressive: 4_000,
        progressiveThreshold: 8_000,
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
                color: withAlpha(annotation.color, 0.25),
                borderColor: annotation.color,
                borderWidth: 2,
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
                padding: [4, 8],
                borderRadius: 4,
                distance: 6,
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
    ...(enableAnnotations && isAnnotating
      ? {
          brush: {
            toolbox: ["rect"],
            xAxisIndex: 0,
            yAxisIndex: 0,
            brushLink: "all",
            outOfBrush: {
              colorAlpha: 0.1,
            },
            brushStyle: {
              borderWidth: 2,
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
      ...(isAnnotating
        ? []
        : [
            {
              type: "inside",
              xAxisIndex: 0,
              filterMode: "none",
            },
          ]),
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 10,
        height: 20,
        borderColor: echartsTheme.axisLineColor,
        fillerColor: withAlpha(currentSignal.color, 0.12),
        handleStyle: {
          color: currentSignal.color,
        },
      },
    ],
    animation: !isLargeSeries,
    animationDuration: isLargeSeries ? 0 : 300,
    media: [
      {
        query: { maxWidth: 768 },
        option: {
          grid: {
            left: "30px",
            right: "30px",
          },
          title: {
            textStyle: { fontSize: 14 },
          },
        },
      },
    ],
  };
}
