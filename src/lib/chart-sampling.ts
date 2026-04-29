import { SignalType } from "@/features/signals/api/types";
import { TimeInterval, type Sample } from "@/features/samples/api/types";

const INTERVAL_TO_MS: Record<TimeInterval, number> = {
  [TimeInterval.OneMinute]: 60 * 1000,
  [TimeInterval.FiveMinutes]: 5 * 60 * 1000,
  [TimeInterval.FifteenMinutes]: 15 * 60 * 1000,
  [TimeInterval.OneHour]: 60 * 60 * 1000,
  [TimeInterval.FourHours]: 4 * 60 * 60 * 1000,
  [TimeInterval.OneDay]: 24 * 60 * 60 * 1000,
  [TimeInterval.OneWeek]: 7 * 24 * 60 * 60 * 1000,
};

export function getIntervalMs(interval: TimeInterval): number {
  return INTERVAL_TO_MS[interval];
}

export function estimateSampleCount(
  startTime: number,
  endTime: number,
  interval: TimeInterval,
): number {
  const duration = Math.max(endTime - startTime, 0);
  return Math.floor(duration / getIntervalMs(interval)) + 1;
}

export function downsampleSamples(
  samples: Sample[],
  signal: SignalType,
  threshold: number,
): Sample[] {
  if (samples.length <= threshold || threshold <= 2) {
    return samples;
  }

  const firstSample = samples[0];
  const lastSample = samples[samples.length - 1];

  if (firstSample === undefined || lastSample === undefined) {
    return samples;
  }

  const sampled: Sample[] = [firstSample];
  const bucketSize = (samples.length - 2) / (threshold - 2);
  let anchorIndex = 0;

  for (let bucketIndex = 0; bucketIndex < threshold - 2; bucketIndex += 1) {
    const nextBucketStart = Math.floor((bucketIndex + 1) * bucketSize) + 1;
    const nextBucketEnd = Math.min(
      Math.floor((bucketIndex + 2) * bucketSize) + 1,
      samples.length,
    );

    let avgTimestamp = 0;
    let avgValue = 0;
    const avgBucketLength = Math.max(nextBucketEnd - nextBucketStart, 1);

    for (let index = nextBucketStart; index < nextBucketEnd; index += 1) {
      const averageSample = samples[index];
      if (!averageSample) {
        continue;
      }

      avgTimestamp += averageSample.timestamp;
      avgValue += averageSample[signal];
    }

    avgTimestamp /= avgBucketLength;
    avgValue /= avgBucketLength;

    const rangeStart = Math.floor(bucketIndex * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((bucketIndex + 1) * bucketSize) + 1,
      samples.length - 1,
    );

    const anchorSample = samples[anchorIndex];
    if (!anchorSample) {
      continue;
    }

    let maxArea = -1;
    let nextAnchorIndex = rangeStart;

    for (let index = rangeStart; index < rangeEnd; index += 1) {
      const candidate = samples[index];
      if (!candidate) {
        continue;
      }

      const area =
        Math.abs(
          (anchorSample.timestamp - avgTimestamp) *
            (candidate[signal] - anchorSample[signal]) -
            (anchorSample.timestamp - candidate.timestamp) *
              (avgValue - anchorSample[signal]),
        ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        nextAnchorIndex = index;
      }
    }

    const nextAnchor = samples[nextAnchorIndex];
    if (!nextAnchor) {
      continue;
    }

    sampled.push(nextAnchor);
    anchorIndex = nextAnchorIndex;
  }

  sampled.push(lastSample);

  return sampled;
}
