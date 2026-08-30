"use client";

import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { PageNodeData } from "./use-graph-data";

interface PageNodeProps {
  data: PageNodeData;
  selected?: boolean;
}

export const PageNode = memo(function PageNodeData({
  data,
  selected,
}: PageNodeProps) {
  const hasIcon = Boolean(data.icon && data.icon !== "📄");

  return (
    <div
      className={cn(
        "group relative flex max-w-[180px] min-w-[120px] cursor-pointer flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200",
        "border-border/60 bg-background/80 backdrop-blur-md",
        "shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
        "hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--color-primary)/0.25)]",
        selected &&
          "border-primary/70 shadow-[0_0_28px_rgba(var(--color-primary)/0.35)] ring-1 ring-primary/30",
      )}
    >
      {/* Glow overlay on hover/selected */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
          "bg-[radial-gradient(ellipse_at_center,rgba(var(--tw-ring-color)/0.08)_0%,transparent_70%)]",
          "group-hover:opacity-100",
          selected && "opacity-100",
        )}
      />

      {/* Icon */}
      <div className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-base leading-none">
        {hasIcon ? (
          <span role="img">{data.icon}</span>
        ) : (
          <FileText
            className="size-4 text-muted-foreground"
            strokeWidth={1.5}
          />
        )}
      </div>

      {/* Title */}
      <span
        className={cn(
          "line-clamp-2 text-xs/tight font-medium text-foreground/90 transition-colors",
          "group-hover:text-foreground",
        )}
        title={data.title}
      >
        {data.title}
      </span>

      {/* Child count badge */}
      {data.childCount > 0 && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {data.childCount}
        </span>
      )}

      {/* CENTERED HANDLES (Placed directly in the physical center of the card) */}
      <Handle
        type="target"
        position={Position.Top}
        className="pointer-events-none opacity-0"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="pointer-events-none opacity-0"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
});
