/* eslint-disable react-hooks/purity */
import { Button } from "@/components/ui/button";

export interface DateRange {
  /** Start timestamp in milliseconds */
  from: number;
  /** End timestamp in milliseconds */
  to: number;
}

export interface DateRangePreset {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Description of the time period */
  description: string;
  /** Function to calculate date range */
  getRange: () => DateRange;
}

const CUSTOM_RANGE_PRESET_ID = "custom";

export interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  selectedRange,
  onRangeChange,
  className = "",
}: DateRangePickerProps) {
  const presets: DateRangePreset[] = [
    {
      id: "24h",
      label: "24H",
      description: "Last 24 hours",
      getRange: () => {
        const now = Date.now();
        return {
          from: now - 24 * 60 * 60 * 1000,
          to: now,
        };
      },
    },
    {
      id: "7d",
      label: "7D",
      description: "Last 7 days",
      getRange: () => {
        const now = Date.now();
        return {
          from: now - 7 * 24 * 60 * 60 * 1000,
          to: now,
        };
      },
    },
    {
      id: "30d",
      label: "30D",
      description: "Last 30 days",
      getRange: () => {
        const now = Date.now();
        return {
          from: now - 30 * 24 * 60 * 60 * 1000,
          to: now,
        };
      },
    },
    {
      id: "1y",
      label: "1Y",
      description: "Last 1 year",
      getRange: () => {
        const now = Date.now();
        return {
          from: now - 365 * 24 * 60 * 60 * 1000,
          to: now,
        };
      },
    },
  ] as const;

  const getSelectedPreset = (): string | null => {
    const tolerance = 60 * 1000;

    for (const preset of presets) {
      const range = preset.getRange();

      if (
        Math.abs(selectedRange.from - range.from) < tolerance &&
        Math.abs(selectedRange.to - range.to) < tolerance
      ) {
        return preset.id;
      }
    }

    return null;
  };

  const selectedPresetId = getSelectedPreset();
  const activePresetId = selectedPresetId ?? CUSTOM_RANGE_PRESET_ID;

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        Time Range
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activePresetId === CUSTOM_RANGE_PRESET_ID ? "primary" : "outline"}
          size="sm"
          disabled
          aria-pressed={activePresetId === CUSTOM_RANGE_PRESET_ID}
          className="range-chip-custom shadow-sm disabled:opacity-100"
          title="Custom zoomed range"
        >
          Custom
        </Button>
        {presets.map((preset) => {
          const isSelected = activePresetId === preset.id;

          return (
            <Button
              key={preset.id}
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => onRangeChange(preset.getRange())}
              className="range-chip-preset shadow-sm"
              title={preset.description}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <div className="text-xs text-slate-600 bg-slate-50 rounded px-3 py-2 font-mono">
        <div>From: {formatDate(selectedRange.from)}</div>
        <div>To: {formatDate(selectedRange.to)}</div>
      </div>

      {selectedPresetId ? (
        <p className="text-sm text-slate-600">
          {presets.find((p) => p.id === selectedPresetId)?.description}
        </p>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-slate-600">Custom zoomed range</p>
          <p className="text-xs text-slate-500">
            Use a preset to zoom back out.
          </p>
        </div>
      )}
    </div>
  );
}
