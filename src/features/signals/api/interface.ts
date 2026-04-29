import type { Signal } from "./types";

export interface SignalsService {
  getAll(): Promise<Signal[]>;
  getById(_id: string): Promise<Signal | null>;
}
