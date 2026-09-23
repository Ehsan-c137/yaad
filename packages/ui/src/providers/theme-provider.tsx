"use client";

import { useCallback, useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function ThemeProvider() {
  // Use null as the SSR sentinel so we never apply "light" during hydration.
  // The inline <script> in <head> already set the correct class before paint.
  const [theme] = useLocalStorage<string | null>("theme", null);
  const hasMountedRef = useRef(false);

  const handleTheme = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    // On the very first effect (after hydration), only act if localStorage
    // actually had a value. If null, the inline script already handled it.
    if (theme === null) {
      hasMountedRef.current = true;
      return;
    }

    hasMountedRef.current = true;
    handleTheme(theme === "dark");
  }, [theme, handleTheme]);

  return null;
}
