import { describe, expect, it } from "vitest";
import { downsampleSamples, estimateSampleCount } from "@/lib/chart-sampling";
import { TimeInterval, type Sample } from "@/features/samples/api/types";
import { SignalType } from "@/features/signals/api/types";

function buildSamples(count: number): Sample[] {
  return Array.from({ length: count }, (_, index) => ({
    timestamp: index * 60_000,
    open: index,
    high: index + 1,
    low: index - 1,
    close: Math.sin(index / 10) * 100 + index,
    volume: index * 10,
  }));
}

describe("chart sampling", () => {
  it("preserves endpoints and monotonic time order when downsampling", () => {
    const samples = buildSamples(5_000);
    const downsampled = downsampleSamples(samples, SignalType.Close, 300);

    expect(downsampled).toHaveLength(300);
    expect(downsampled[0]).toEqual(samples[0]);
    expect(downsampled[downsampled.length - 1]).toEqual(
      samples[samples.length - 1],
    );

    for (let index = 1; index < downsampled.length; index += 1) {
      expect(downsampled[index]?.timestamp).toBeGreaterThan(
        downsampled[index - 1]?.timestamp ?? -Infinity,
      );
    }
  });

  it("returns the original samples when threshold exceeds sample count", () => {
    const samples = buildSamples(100);
    expect(downsampleSamples(samples, SignalType.Volume, 200)).toBe(samples);
  });

  it("estimates interval sample counts correctly", () => {
    const start = 0;
    const end = 24 * 60 * 60 * 1000;

    expect(estimateSampleCount(start, end, TimeInterval.OneMinute)).toBe(1_441);
    expect(estimateSampleCount(start, end, TimeInterval.OneHour)).toBe(25);
  });
});
