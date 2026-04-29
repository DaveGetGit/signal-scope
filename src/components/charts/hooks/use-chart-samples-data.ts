import { useMemo } from "react";
import { useGetSamples } from "@/features/samples/hooks/use-get-samples";
import { useGetSignals } from "@/features/signals/hooks/use-get-signals";
import type { SamplesParams } from "@/features/samples/api/types";
import type { SignalType } from "@/features/signals/api/types";
import { getIntervalForRange } from "@/lib/chart-interval";
import {
  buildSyntheticSamplesResponse,
  type PerfProfile,
} from "@/lib/chart-perf-data";

interface UseChartSamplesDataArgs {
  symbol: string;
  signal: SignalType;
  startTime: number | undefined;
  endTime: number | undefined;
  perfProfile: PerfProfile | undefined;
  maxRenderPoints: number;
}

export function useChartSamplesData({
  symbol,
  signal,
  startTime,
  endTime,
  perfProfile,
  maxRenderPoints,
}: UseChartSamplesDataArgs) {
  const samplesParams = useMemo(() => {
    const params: SamplesParams = {
      symbol,
      interval: getIntervalForRange(startTime, endTime),
      limit: 1000,
      signal,
    };

    if (!perfProfile) {
      params.targetPoints = maxRenderPoints;
    }

    if (startTime !== undefined) {
      params.startTime = startTime;
    }

    if (endTime !== undefined) {
      params.endTime = endTime;
    }

    return params;
  }, [endTime, maxRenderPoints, perfProfile, signal, startTime, symbol]);

  const { data: liveSamplesData, isLoading, error } = useGetSamples(
    samplesParams,
    perfProfile === undefined,
  );

  const samplesData = useMemo(() => {
    if (!perfProfile || startTime === undefined || endTime === undefined) {
      return liveSamplesData;
    }

    return buildSyntheticSamplesResponse(
      {
        from: startTime,
        to: endTime,
      },
      perfProfile,
      signal,
    );
  }, [endTime, liveSamplesData, perfProfile, signal, startTime]);

  const { data: signals } = useGetSignals();
  const currentSignal = signals?.find((entry) => entry.id === signal);
  const isLargeSeries =
    (samplesData?.rawCount ?? samplesData?.count ?? 0) > maxRenderPoints;

  const sampleBounds = useMemo(() => {
    const firstSampleTimestamp = samplesData?.samples?.[0]?.timestamp;
    const lastSampleTimestamp =
      samplesData?.samples?.[samplesData.samples.length - 1]?.timestamp;

    if (
      typeof firstSampleTimestamp !== "number" ||
      typeof lastSampleTimestamp !== "number"
    ) {
      return null;
    }

    return {
      start: Math.min(firstSampleTimestamp, lastSampleTimestamp),
      end: Math.max(firstSampleTimestamp, lastSampleTimestamp),
    };
  }, [samplesData]);

  return {
    currentSignal,
    error,
    isLargeSeries,
    isLoading,
    sampleBounds,
    samplesData,
  };
}
