export interface Instrument {
  symbol: string;
  lastPrice: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  tradeCount24h: number;
}

export enum InstrumentSortField {
  Symbol = "symbol",
  LastPrice = "lastPrice",
  PriceChangePercent24h = "priceChangePercent24h",
  Volume24h = "volume24h",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export interface InstrumentsFilter {
  search?: string;
  sortBy?: InstrumentSortField;
  sortOrder?: SortOrder;
}

export interface InstrumentsPagination {
  page: number;
  limit: number;
}

export interface InstrumentsResponse {
  instruments: Instrument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BinanceTickerResponse {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}
