import type { SortOrder } from "@/features/instruments/api/types";

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface BaseFilter {
  search?: string;
}
