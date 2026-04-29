export interface Sample {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export enum TimeInterval {
  OneMinute = "1m",
  FiveMinutes = "5m",
  FifteenMinutes = "15m",
  OneHour = "1h",
  FourHours = "4h",
  OneDay = "1d",
  OneWeek = "1w",
}

export interface SamplesParams {
  symbol: string;
  interval: TimeInterval;
  startTime?: number;
  endTime?: number;
  limit?: number;
  targetPoints?: number;
  signal?: import("@/features/signals/api/types").SignalType;
}

export interface SamplesResponse {
  samples: Sample[];
  count: number;
  rawCount: number;
  isDownsampled: boolean;
  params: SamplesParams;
}

export type BinanceKlineResponse = [
  number, // Open time
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string, // Ignore
];
