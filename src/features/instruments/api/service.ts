import { HttpClient } from "@/lib/http-client";
import type { InstrumentsService } from "./interface";
import type {
  InstrumentsFilter,
  InstrumentsPagination,
  InstrumentsResponse,
  Instrument,
  BinanceTickerResponse,
} from "./types";
import { SortOrder } from "./types";

export class HttpInstrumentsService implements InstrumentsService {
  private static instance: HttpInstrumentsService;
  private httpClient: HttpClient;

  private readonly CURATED_SYMBOLS = [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "AVAXUSDT",
    "DOTUSDT",
    "MATICUSDT",
    "LINKUSDT",
    "LTCUSDT",
    "UNIUSDT",
    "ATOMUSDT",
    "FILUSDT",
    "TRXUSDT",
    "ETCUSDT",
    "XLMUSDT",
    "VETUSDT",
    "ICPUSDT",
  ];

  private constructor() {
    this.httpClient = HttpClient.getInstance();
  }

  public static getInstance(): HttpInstrumentsService {
    if (!HttpInstrumentsService.instance) {
      HttpInstrumentsService.instance = new HttpInstrumentsService();
    }
    return HttpInstrumentsService.instance;
  }

  public async list(
    filters: InstrumentsFilter,
    pagination: InstrumentsPagination,
  ): Promise<InstrumentsResponse> {
    const rawTickers = await this.fetchTickerData();
    const instruments = rawTickers.map((ticker) =>
      this.adaptBinanceTickerToInstrument(ticker),
    );
    const filtered = this.applyFilters(instruments, filters);
    const sorted = this.applySorting(filtered, filters);
    const paginated = this.applyPagination(sorted, pagination);

    return {
      instruments: paginated,
      total: filtered.length,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(filtered.length / pagination.limit),
    };
  }

  private async fetchTickerData(): Promise<BinanceTickerResponse[]> {
    const symbolsParam = encodeURIComponent(
      JSON.stringify(this.CURATED_SYMBOLS),
    );

    const response = await this.httpClient.get<BinanceTickerResponse[]>(
      `/api/v3/ticker/24hr?symbols=${symbolsParam}`,
    );

    return response;
  }

  private adaptBinanceTickerToInstrument(
    ticker: BinanceTickerResponse,
  ): Instrument {
    return {
      symbol: ticker.symbol,
      lastPrice: parseFloat(ticker.lastPrice),
      priceChangePercent24h: parseFloat(ticker.priceChangePercent),
      volume24h: parseFloat(ticker.volume),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      tradeCount24h: ticker.count,
    };
  }

  private applyFilters(
    instruments: Instrument[],
    filters: InstrumentsFilter,
  ): Instrument[] {
    let result = instruments;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter((instrument) =>
        instrument.symbol.toLowerCase().includes(searchTerm),
      );
    }

    return result;
  }

  private applySorting(
    instruments: Instrument[],
    filters: InstrumentsFilter,
  ): Instrument[] {
    if (!filters.sortBy) {
      return instruments;
    }

    const sortOrder = filters.sortOrder === SortOrder.Desc ? -1 : 1;

    return [...instruments].sort((a, b) => {
      const aValue = a[filters.sortBy!];
      const bValue = b[filters.sortBy!];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * sortOrder;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * sortOrder;
      }

      return 0;
    });
  }

  private applyPagination(
    instruments: Instrument[],
    pagination: InstrumentsPagination,
  ): Instrument[] {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return instruments.slice(startIndex, endIndex);
  }
}

export const instrumentsService = HttpInstrumentsService.getInstance();
