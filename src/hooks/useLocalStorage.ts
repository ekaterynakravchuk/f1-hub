"use client";

import { useCallback, useSyncExternalStore } from "react";

function getSnapshot<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item !== null ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function subscribe(key: string, callback: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => getSnapshot(key, initialValue),
    () => initialValue
  );

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(getSnapshot(key, initialValue))
            : newValue;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        // Dispatch synthetic StorageEvent so useSyncExternalStore picks up same-tab changes
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: JSON.stringify(resolved) })
        );
      } catch {
        // localStorage may be unavailable (private browsing, quota exceeded)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setValue];
}
