import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Number formatting constants
const CURRENCY_MIN_DECIMALS = 2;
const CURRENCY_MAX_DECIMALS = 6;
const DEFAULT_NUMBER_DECIMALS = 2;
const PERCENTAGE_DECIMALS = 2;
const COMPACT_MAX_DECIMALS = 2;
const PERCENTAGE_DENOMINATOR = 100;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: CURRENCY_MIN_DECIMALS,
    maximumFractionDigits: CURRENCY_MAX_DECIMALS,
  }).format(value);
}

export function formatNumber(
  value: number,
  decimals: number = DEFAULT_NUMBER_DECIMALS,
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: PERCENTAGE_DECIMALS,
    maximumFractionDigits: PERCENTAGE_DECIMALS,
  }).format(value / PERCENTAGE_DENOMINATOR);

  return value >= 0 ? `+${formatted}` : formatted;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits: 0,
    maximumFractionDigits: COMPACT_MAX_DECIMALS,
  }).format(value);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): T {
  let timeout: number;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  }) as T;
}

export function getPercentageColor(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-muted-token";
}
