import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { httpErrorHandler } from "./http-error-handler";
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor(config: HttpClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        ...config.defaultHeaders,
      },
    });

    this.setupInterceptors();
  }

  public static initialize(config: HttpClientConfig): HttpClient {
    if (HttpClient.instance) {
      throw new Error(
        "HttpClient already initialized. Use getInstance() instead.",
      );
    }
    HttpClient.instance = new HttpClient(config);
    return HttpClient.instance;
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      throw new Error("HttpClient not initialized. Call initialize() first.");
    }
    return HttpClient.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(
        url,
        config,
      );
      return response.data;
    } catch (error) {
      const apiError = httpErrorHandler.normalize(error);
      throw apiError;
    }
  }

  public async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      const apiError = httpErrorHandler.normalize(error);
      throw apiError;
    }
  }

  public async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      const apiError = httpErrorHandler.normalize(error);
      throw apiError;
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(
        url,
        config,
      );
      return response.data;
    } catch (error) {
      const apiError = httpErrorHandler.normalize(error);
      throw apiError;
    }
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    );
  }
}
