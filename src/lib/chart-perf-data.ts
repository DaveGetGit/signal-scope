import type { DateRange } from "@/components/charts/date-range-picker";
import { SignalType } from "@/features/signals/api/types";
import {
  TimeInterval,
  type Sample,
  type SamplesResponse,
} from "@/features/samples/api/types";

export interface PerfProfile {
  label: string;
  pointCount: number;
}

export const PERF_PROFILES = {
  "500k": {
    label: "500k synthetic points",
    pointCount: 500_000,
  },
} satisfies Record<string, PerfProfile>;

function buildSyntheticSample(
  index: number,
  timestamp: number,
  normalizedPosition: number,
): Sample {
  const longWave = Math.sin(normalizedPosition * Math.PI * 10) * 1_800;
  const mediumWave = Math.sin(normalizedPosition * Math.PI * 40) * 520;
  const noiseWave = Math.sin(index * 0.173) * 55;
  const trend = normalizedPosition * 9_500;
  const basePrice = 42_000 + trend + longWave + mediumWave + noiseWave;
  const open = basePrice - Math.sin(index * 0.11) * 24;
  const close = basePrice + Math.cos(index * 0.07) * 24;
  const high = Math.max(open, close) + 32;
  const low = Math.min(open, close) - 32;
  const volume =
    1_500 +
    Math.abs(Math.sin(normalizedPosition * Math.PI * 14)) * 3_000 +
    Math.abs(Math.cos(index * 0.031)) * 800;

  return {
    timestamp,
    open,
    high,
    low,
    close,
    volume,
  };
}

export function buildSyntheticSamples(
  range: DateRange,
  pointCount: number,
): Sample[] {
  if (pointCount <= 0) {
    return [];
  }

  if (pointCount === 1) {
    return [buildSyntheticSample(0, range.from, 0)];
  }

  const duration = Math.max(range.to - range.from, pointCount - 1);
  const step = duration / (pointCount - 1);

  return Array.from({ length: pointCount }, (_, index) => {
    const timestamp = Math.round(range.from + step * index);
    const normalizedPosition = index / (pointCount - 1);
    return buildSyntheticSample(index, timestamp, normalizedPosition);
  });
}

export function buildSyntheticSamplesResponse(
  range: DateRange,
  profile: PerfProfile,
  signal: SignalType,
): SamplesResponse {
  const samples = buildSyntheticSamples(range, profile.pointCount);

  return {
    samples,
    count: samples.length,
    rawCount: samples.length,
    isDownsampled: false,
    params: {
      symbol: "PERF",
      interval: TimeInterval.OneMinute,
      startTime: range.from,
      endTime: range.to,
      signal,
    },
  };
}
