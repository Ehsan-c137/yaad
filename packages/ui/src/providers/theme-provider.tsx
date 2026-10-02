"use client";

import { useCallback, useEffect, useRef } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

export function ThemeProvider() {
  const [theme] = useLocalStorage<string | null>("theme", null);
  const hasMountedRef = useRef(false);

  const handleTheme = useCallback((isDark: boolean) => {
    const root = document.documentElement;

    if (isDark) {
      if (!root.classList.contains("dark")) {
        root.classList.add("dark");
      }
    } else if (root.classList.contains("dark")) {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (theme === null) {
      hasMountedRef.current = true;
      return;
    }

    hasMountedRef.current = true;
    handleTheme(theme === "dark");
  }, [theme, handleTheme]);

  return null;
}
