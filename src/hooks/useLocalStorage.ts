"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

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
  // Cache parsed value to return stable reference between renders.
  // useSyncExternalStore uses Object.is() — without caching, JSON.parse
  // returns a new object every call, causing an infinite re-render loop.
  const cache = useRef<{ raw: string | null; parsed: T }>({
    raw: null,
    parsed: initialValue,
  });

  const getSnapshot = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === cache.current.raw) return cache.current.parsed;
      const parsed = raw !== null ? (JSON.parse(raw) as T) : initialValue;
      cache.current = { raw, parsed };
      return parsed;
    } catch {
      return initialValue;
    }
  };

  const value = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    getSnapshot,
    () => initialValue
  );

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(getSnapshot())
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
