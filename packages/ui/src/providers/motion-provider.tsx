"use client";

import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";

/**
 * Initializes device performance detection, reduced motion listeners, and synchronizes
 * data-low-device and data-page-transitions attributes on <html> for CSS optimization.
 */
export function MotionProvider() {
  usePageTransitionPreference();
  return null;
}
