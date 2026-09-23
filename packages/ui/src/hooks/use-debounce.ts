import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any fast-changing value over a specified delay.
 *
 * @param value The value to debounce.
 * @param delay Delay in milliseconds (default: 250ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
