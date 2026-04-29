import { AxiosError } from "axios";
import type { ApiError } from "@/types/common";

export class HttpErrorHandler {
  private static instance: HttpErrorHandler;

  private constructor() {}

  public static getInstance(): HttpErrorHandler {
    if (!HttpErrorHandler.instance) {
      HttpErrorHandler.instance = new HttpErrorHandler();
    }
    return HttpErrorHandler.instance;
  }

  public normalize(error: unknown): ApiError {
    if (this.isAxiosError(error)) {
      return this.normalizeAxiosError(error);
    }

    if (error instanceof Error) {
      return {
        status: 0,
        error: "UnknownError",
        message: error.message,
        details: error.stack,
      };
    }

    return {
      status: 0,
      error: "UnknownError",
      message: "An unexpected error occurred",
      details: error,
    };
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      error !== null &&
      typeof error === "object" &&
      "isAxiosError" in error &&
      (error as AxiosError).isAxiosError === true
    );
  }

  private normalizeAxiosError(error: AxiosError): ApiError {
    if (!error.response) {
      return {
        status: 0,
        error: error.code || "NetworkError",
        message: error.message || "Network error occurred",
        details: {
          url: error.config?.url,
          method: error.config?.method,
        },
      };
    }

    const { status, statusText, data } = error.response;

    return {
      status,
      error: this.getErrorCode(status),
      message: this.getErrorMessage(status, statusText, data),
      details: {
        url: error.config?.url,
        method: error.config?.method,
        responseData: data,
      },
    };
  }

  private getErrorCode(status: number): string {
    if (status >= 400 && status < 500) {
      return "ClientError";
    }
    if (status >= 500) {
      return "ServerError";
    }
    return "HttpError";
  }

  private getErrorMessage(
    status: number,
    statusText: string,
    data: unknown,
  ): string {
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    switch (status) {
      case 400:
        return "Bad request - please check your input";
      case 401:
        return "Authentication required";
      case 403:
        return "Access forbidden";
      case 404:
        return "Resource not found";
      case 429:
        return "Too many requests - please try again later";
      case 500:
        return "Internal server error";
      case 502:
        return "Bad gateway";
      case 503:
        return "Service unavailable";
      default:
        return statusText || `HTTP error ${status}`;
    }
  }
}

export const httpErrorHandler = HttpErrorHandler.getInstance();
