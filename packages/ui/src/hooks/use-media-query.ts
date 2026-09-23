import { useEffect, useState } from "react";

const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useMediaQuery(query: string | Breakpoint): boolean {
  const mediaQuery = breakpoints[query as Breakpoint] || query;

  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(mediaQuery).matches;
    }

    return false;
  });

  useEffect(() => {
    const matchMedia = window.matchMedia(mediaQuery);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(matchMedia.matches);

    matchMedia.addEventListener("change", handleChange);
    return () => matchMedia.removeEventListener("change", handleChange);
  }, [mediaQuery]);

  return matches;
}
