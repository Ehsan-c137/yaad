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
    hasMountedRef.current = true;

    if (theme === "dark") {
      handleTheme(true);
      return;
    }

    if (theme === "light") {
      handleTheme(false);
      return;
    }

    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    handleTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      handleTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, handleTheme]);

  return null;
}
