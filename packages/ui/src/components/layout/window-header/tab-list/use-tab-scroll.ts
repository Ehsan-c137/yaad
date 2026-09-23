import { useCallback, useEffect, useRef } from "react";

export function useTabScroll(activeTabId: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeTabId || !containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    activeEl?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeTabId]);

  // Horizontal wheel handler
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  return { containerRef, handleWheel };
}
