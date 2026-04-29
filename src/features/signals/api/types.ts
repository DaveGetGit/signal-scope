export enum SignalType {
  Close = "close",
  Volume = "volume",
}

export enum SignalFormat {
  Currency = "currency",
  Number = "number",
}

export interface Signal {
  id: SignalType;
  name: string;
  description: string;
  klinesIndex: number;
  color: string;
  format: SignalFormat;
}
