import { HttpClient } from "@/lib/http-client";
import type { SamplesService } from "./interface";
import type {
  SamplesParams,
  SamplesResponse,
  Sample,
  BinanceKlineResponse,
} from "./types";
import {
  downsampleSamples,
  estimateSampleCount,
  getIntervalMs,
} from "@/lib/chart-sampling";

const BINANCE_KLINES_LIMIT = 1000;

export class HttpSamplesService implements SamplesService {
  private static instance: HttpSamplesService;
  private httpClient: HttpClient;

  private constructor() {
    this.httpClient = HttpClient.getInstance();
  }

  public static getInstance(): HttpSamplesService {
    if (!HttpSamplesService.instance) {
      HttpSamplesService.instance = new HttpSamplesService();
    }
    return HttpSamplesService.instance;
  }

  public async fetch(params: SamplesParams): Promise<SamplesResponse> {
    const rawKlines = await this.fetchKlineRange(params);
    const rawSamples = rawKlines.map((kline) =>
      this.adaptBinanceKlineToSample(kline),
    );
    const samples =
      params.targetPoints !== undefined &&
      params.signal !== undefined &&
      rawSamples.length > params.targetPoints
        ? downsampleSamples(rawSamples, params.signal, params.targetPoints)
        : rawSamples;

    return {
      samples,
      count: samples.length,
      rawCount: rawSamples.length,
      isDownsampled: samples.length < rawSamples.length,
      params,
    };
  }

  private async fetchKlineRange(
    params: SamplesParams,
  ): Promise<BinanceKlineResponse[]> {
    if (params.startTime === undefined || params.endTime === undefined) {
      return this.httpClient.get<BinanceKlineResponse[]>(
        this.buildKlinesUrl(params),
      );
    }

    const intervalMs = getIntervalMs(params.interval);
    const estimatedCount = estimateSampleCount(
      params.startTime,
      params.endTime,
      params.interval,
    );
    const requestLimit = Math.min(
      params.limit ?? BINANCE_KLINES_LIMIT,
      BINANCE_KLINES_LIMIT,
    );
    const shouldChunk = estimatedCount > requestLimit;

    if (!shouldChunk) {
      return this.httpClient.get<BinanceKlineResponse[]>(
        this.buildKlinesUrl({
          ...params,
          limit: requestLimit,
        }),
      );
    }

    const klines: BinanceKlineResponse[] = [];
    const seenTimestamps = new Set<number>();
    let nextStartTime = params.startTime;

    while (nextStartTime <= params.endTime) {
      const chunk = await this.httpClient.get<BinanceKlineResponse[]>(
        this.buildKlinesUrl({
          ...params,
          startTime: nextStartTime,
          limit: requestLimit,
        }),
      );

      if (chunk.length === 0) {
        break;
      }

      for (const kline of chunk) {
        const openTime = kline[0];
        if (!seenTimestamps.has(openTime)) {
          seenTimestamps.add(openTime);
          klines.push(kline);
        }
      }

      const lastChunk = chunk[chunk.length - 1];
      if (!lastChunk) {
        break;
      }

      const lastOpenTime = lastChunk[0];
      const candidateNextStart = lastOpenTime + intervalMs;

      if (candidateNextStart <= nextStartTime) {
        break;
      }

      nextStartTime = candidateNextStart;

      if (chunk.length < requestLimit || lastOpenTime >= params.endTime) {
        break;
      }
    }

    return klines;
  }

  private buildKlinesUrl(params: SamplesParams): string {
    const searchParams = new URLSearchParams();

    searchParams.append("symbol", params.symbol);
    searchParams.append("interval", params.interval);

    if (params.startTime) {
      searchParams.append("startTime", params.startTime.toString());
    }

    if (params.endTime) {
      searchParams.append("endTime", params.endTime.toString());
    }

    if (params.limit) {
      const limit = Math.min(params.limit, BINANCE_KLINES_LIMIT);
      searchParams.append("limit", limit.toString());
    }

    return `/api/v3/klines?${searchParams.toString()}`;
  }

  private adaptBinanceKlineToSample(kline: BinanceKlineResponse): Sample {
    const [
      openTime,
      open,
      high,
      low,
      close,
      volume,
    ] = kline;

    return {
      timestamp: openTime,
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseFloat(volume),
    };
  }
}

export const samplesService = HttpSamplesService.getInstance();
