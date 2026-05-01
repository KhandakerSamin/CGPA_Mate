"use client";

import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hydrate once on the client to avoid server/client mismatches.
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        setValue(JSON.parse(stored));
      } catch {
        setValue(initialValue);
      }
    }
    setHydrated(true);
  }, [key, initialValue]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
