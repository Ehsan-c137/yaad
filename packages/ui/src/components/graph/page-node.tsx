/* eslint-disable complexity, @typescript-eslint/no-shadow, @typescript-eslint/no-unnecessary-condition */

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import type { PageNodeData } from "./use-graph-data";

interface PageNodeProps {
  data: PageNodeData;
  selected?: boolean;
}

export const PageNode = memo(function PageNode({
  data,
  selected,
}: PageNodeProps) {
  const isDark = useTheme();

  const radius = data.radius ?? 8;
  const isHovered = Boolean(data.isHovered);
  const isNeighbor = Boolean(data.isNeighbor);
  const isDimmed = Boolean(data.isDimmed);
  const isHighlighted = isHovered || isNeighbor || selected;
  const showLabels = data.showLabels !== false;

  const color = data.color ?? {
    fill: "var(--primary)",
    stroke: "var(--primary)",
    glow: "var(--ring)",
  };

  const hasIcon = Boolean(data.icon && data.icon !== "📄");

  return (
    <div
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }}
      className={cn(
        "group relative flex items-center justify-center cursor-pointer select-none transition-all duration-150",
        isDimmed ? "opacity-40" : "opacity-100",
      )}
    >
      {/* Main Obsidian circular dot: 100% solid, fully opaque */}
      <div
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          backgroundColor: color.fill,
          borderColor: isHovered || selected ? "#ffffff" : color.stroke,
        }}
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 transition-all duration-150 ease-out",
          (isHovered || selected) && "scale-125 shadow-lg ring-2 ring-white/70",
          isNeighbor && "scale-110",
        )}
      >
        {/* Subtle icon indicator for large hubs or on hover */}
        {hasIcon && (radius >= 13 || isHovered) && (
          <span
            className="pointer-events-none text-[10px] leading-none select-none text-white font-bold"
            role="img"
          >
            {data.icon}
          </span>
        )}
      </div>

      {/* Floating text label underneath node */}
      {showLabels && (
        <div
          className={cn(
            "pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap transition-all duration-200",
            isHighlighted ? "z-30" : "z-10",
          )}
        >
          <span
            className={cn(
              "block max-w-[150px] truncate text-center text-[11px] leading-tight tracking-tight transition-colors duration-200",
              isDark
                ? "text-neutral-300 [text-shadow:_0_1px_3px_rgba(0,0,0,0.95)]"
                : "text-neutral-700 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]",
              (isHovered || selected) &&
                "scale-105 font-semibold text-foreground",
              isNeighbor && "font-medium text-foreground",
            )}
            title={data.title}
          >
            {data.title}
          </span>
        </div>
      )}

      {/* Centered handles: placed precisely in the physical center of the circular dot */}
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
