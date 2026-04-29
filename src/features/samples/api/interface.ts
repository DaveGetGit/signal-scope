import type { SamplesParams, SamplesResponse } from "./types";

export interface SamplesService {
  fetch(params: SamplesParams): Promise<SamplesResponse>;
}
