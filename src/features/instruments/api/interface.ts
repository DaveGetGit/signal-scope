import type {
  InstrumentsFilter,
  InstrumentsPagination,
  InstrumentsResponse,
} from "./types";

export interface InstrumentsService {
  list(
    filters: InstrumentsFilter,
    pagination: InstrumentsPagination,
  ): Promise<InstrumentsResponse>;
}
