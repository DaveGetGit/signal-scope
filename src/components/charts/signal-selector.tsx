import { useGetSignals } from "@/features/signals/hooks/use-get-signals";
import { Button } from "@/components/ui/button";
import type { SignalType } from "@/features/signals/api/types";
import { withAlpha } from "@/lib/theme";

export interface SignalSelectorProps {
  selectedSignal: SignalType;
  onSignalChange: (signal: SignalType) => void;
  className?: string;
}

export function SignalSelector({
  selectedSignal,
  onSignalChange,
  className = "",
}: SignalSelectorProps) {
  const { data: signals, isLoading } = useGetSignals();

  if (isLoading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!signals) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        Signal Type
      </label>

      <div className="flex flex-wrap gap-2">
        {signals.map((signal) => {
          const isSelected = signal.id === selectedSignal;

          return (
            <Button
              key={signal.id}
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => onSignalChange(signal.id)}
              className="signal-option-button flex items-center space-x-2 justify-start shadow-sm"
              style={{
                backgroundColor: isSelected ? signal.color : "var(--surface-card)",
                borderColor: isSelected ? signal.color : undefined,
                color: isSelected ? "var(--text-inverse)" : signal.color,
                boxShadow: isSelected
                  ? `0 8px 20px ${withAlpha(signal.color, 0.18)}`
                  : undefined,
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isSelected
                    ? "var(--text-inverse)"
                    : signal.color,
                  opacity: isSelected ? 0.9 : 1,
                }}
              />

              <span className="font-medium">{signal.name}</span>
            </Button>
          );
        })}
      </div>

      {signals.find((s) => s.id === selectedSignal) && (
        <p className="text-sm text-slate-600 mt-2">
          {signals.find((s) => s.id === selectedSignal)?.description}
        </p>
      )}
    </div>
  );
}
