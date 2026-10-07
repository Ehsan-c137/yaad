/* eslint-disable @eslint-react/naming-convention-ref-name */
"use client";

import { useEffect, useRef } from "react";

import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";

export function useSlidingPill<
  TPill extends HTMLElement = HTMLSpanElement,
  TItem extends HTMLElement = HTMLButtonElement,
>(activeIndex: number, extraDeps: React.DependencyList = []) {
  const { transitionsEnabled } = usePageTransitionPreference();

  const pillRef = useRef<TPill>(null);
  const itemRefs = useRef<(TItem | null)[]>([]);
  const isMountedRef = useRef(false);

  const moveTo = (idx: number, animate: boolean) => {
    const item = itemRefs.current[idx];
    const pill = pillRef.current;
    if (!item || !pill) return false;

    const top = item.offsetTop;
    const height = item.offsetHeight;
    const left = item.offsetLeft;
    const width = item.offsetWidth;

    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translate(${left}px, ${top}px)`;
      pill.style.height = `${height}px`;
      pill.style.width = `${width}px`;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translate(${left}px, ${top}px)`;
      pill.style.height = `${height}px`;
      pill.style.width = `${width}px`;
    }

    return true;
  };

  useEffect(() => {
    if (activeIndex === -1) return;

    if (!isMountedRef.current) {
      const id = window.requestAnimationFrame(() => {
        const success = moveTo(activeIndex, false);
        if (success) isMountedRef.current = true;
      });
      return () => window.cancelAnimationFrame(id);
    } else {
      moveTo(activeIndex, transitionsEnabled);
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [activeIndex, transitionsEnabled, ...extraDeps]);

  useEffect(() => {
    const onResize = () => {
      moveTo(activeIndex, false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  return { pillRef, itemRefs };
}
