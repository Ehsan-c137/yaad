import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/hooks/use-theme";

import { Switch } from "./switch";

export function ToggleThemeButton() {
  const [theme, setTheme] = useLocalStorage<string | null>("theme", null);
  const isDarkSystem = useTheme();
  const isDarkMode = theme !== null ? theme === "dark" : isDarkSystem;
  const ref = useRef<HTMLSpanElement | null>(null);

  const handleTheme = useCallback((newTheme: boolean) => {
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = async (nextDark: boolean) => {
    const applyTheme = () => {
      setTheme(nextDark ? "dark" : "light");
      handleTheme(nextDark);
    };

    /**
     * Return early if View Transition API is not supported
     * or user prefers reduced motion
     */
    if (
      !ref.current ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme();
      return;
    }

    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          applyTheme();
        });
      });

      await transition.ready;

      const { top, left, width, height } = ref.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const right = window.innerWidth - left;
      const bottom = window.innerHeight - top;
      const maxRadius = Math.hypot(
        Math.max(left, right),
        Math.max(top, bottom),
      );

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
    } catch {
      applyTheme();
    }
  };

  return (
    <span ref={ref} className="inline-flex">
      <Switch
        checked={isDarkMode}
        onCheckedChange={(checked) => {
          void toggleDarkMode(checked);
        }}
      />
    </span>
  );
}
