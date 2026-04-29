import { useEffect, useState } from "react";

// Default debounce delay in milliseconds
const DEFAULT_DEBOUNCE_DELAY_MS = 300;

export function useDebounce<T>(value: T, delay: number = DEFAULT_DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
