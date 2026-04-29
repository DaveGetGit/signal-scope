import type { SignalsService } from "./interface";
import { SignalFormat, SignalType, type Signal } from "./types";
import { echartsTheme } from "@/lib/theme";

export class StaticSignalsService implements SignalsService {
  private static instance: StaticSignalsService;

  private readonly SIGNALS: Signal[] = [
    {
      id: SignalType.Close,
      name: "Close Price",
      description: "Closing price for each time period",
      klinesIndex: 4,
      color: echartsTheme.signals.close,
      format: SignalFormat.Currency,
    },
    {
      id: SignalType.Volume,
      name: "Volume",
      description: "Trading volume for each time period",
      klinesIndex: 5,
      color: echartsTheme.signals.volume,
      format: SignalFormat.Number,
    },
  ];

  private constructor() {}

  public static getInstance(): StaticSignalsService {
    if (!StaticSignalsService.instance) {
      StaticSignalsService.instance = new StaticSignalsService();
    }
    return StaticSignalsService.instance;
  }

  public async getAll(): Promise<Signal[]> {
    return [...this.SIGNALS];
  }

  public async getById(id: string): Promise<Signal | null> {
    const signal = this.SIGNALS.find((s) => s.id === id);
    return signal ? { ...signal } : null;
  }
}

export const signalsService = StaticSignalsService.getInstance();
