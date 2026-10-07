/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className = "",
  animation = "reveal-fade-up",
  threshold = 0.01,
  rootMargin = "0px",
}: {
  children: ReactNode;
  className?: string;
  animation?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver;

    // Small delay ensures DOM layout stabilizes before observing, preventing
    // false intersections if elements are temporarily at y=0 during initial render
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Reveal only once
          }
        },
        { threshold, rootMargin },
      );

      if (ref.current) {
        observer.observe(ref.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);

      if (observer) observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={`${animation} ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
