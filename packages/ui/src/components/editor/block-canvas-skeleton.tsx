"use client";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

/**
 * Lightweight placeholder skeleton for the block canvas content area.
 * Keeps the page header, saved title, and icon stable during document hydration.
 */
export function BlockCanvasSkeleton() {
  return (
    <div
      data-slot="block-canvas-skeleton"
      className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6 animate-pulse"
    >
      <div className={cn(styles.skeleton, "h-5 w-4/5 rounded-md")} />
      <div className={cn(styles.skeleton, "h-5 w-full rounded-md")} />
      <div className={cn(styles.skeleton, "h-5 w-3/5 rounded-md")} />
      <div className="h-2" />
      <div className={cn(styles.skeleton, "h-5 w-11/12 rounded-md")} />
      <div className={cn(styles.skeleton, "h-5 w-2/3 rounded-md")} />
    </div>
  );
}
