import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { Switch } from "./switch";

export function ToggleThemeButton() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  const handleTheme = useCallback((newTheme: boolean | null) => {
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = async (isDark: boolean) => {
    /**
     * Return early if View Transition API is not supported
     * or user prefers reduced motion
     */
    if (
      !ref.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsDarkMode(isDark);
      setTheme(isDark ? "dark" : "light");
      handleTheme(isDark);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(isDarkMode);
        setTheme(isDarkMode ? "dark" : "light");
        handleTheme(isDarkMode);
      });
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  useIsomorphicLayoutEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  return <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />;
}
