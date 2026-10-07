"use client";

import { useCallback, useSyncExternalStore } from "react";

type LocalstorageKeys =
  "is-sidebar-open" | "locale" | "page-transition-preference" | "theme";

type StorageListener = () => void;

const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", notifyListeners);
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

const snapshotCache = new Map<
  string,
  { raw: string | null; parsed: unknown }
>();

function getSnapshot<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  try {
    const raw = window.localStorage.getItem(key);
    const cached = snapshotCache.get(key);

    if (cached?.raw === raw) {
      return cached.parsed as T;
    }

    let parsed: T;

    if (raw === null) {
      parsed = initialValue;
    } else {
      try {
        parsed = JSON.parse(raw) as T;
      } catch {
        parsed = initialValue;
      }
    }

    snapshotCache.set(key, { raw, parsed });
    return parsed;
  } catch {
    return initialValue;
  }
}

/**
 * @param key The localStorage key to use.
 * @param initialValue The value to use if nothing is stored in localStorage yet.
 */
export function useLocalStorage<T>(
  key: LocalstorageKeys,
  initialValue: T,
): [T, (value: ((prev: T) => T) | T) => void] {
  const getSnap = useCallback(
    () => getSnapshot(key, initialValue),
    [key, initialValue],
  );
  const getServerSnap = useCallback(() => initialValue, [initialValue]);

  const storedValue = useSyncExternalStore(subscribe, getSnap, getServerSnap);

  const setValue = useCallback(
    (value: ((prev: T) => T) | T) => {
      try {
        const currentValue = getSnapshot(key, initialValue);
        const nextValue =
          typeof value === "function"
            ? (value as (prevVal: T) => T)(currentValue)
            : value;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
          snapshotCache.set(key, {
            raw: JSON.stringify(nextValue),
            parsed: nextValue,
          });
          notifyListeners();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, initialValue],
  );

  return [storedValue, setValue];
}
