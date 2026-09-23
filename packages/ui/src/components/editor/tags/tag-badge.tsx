"use client";

import type { Tag, TagColor } from "@yaad/core/types/document";

import { useTagStore } from "@yaad/core/store/use-tag-store";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  default: "bg-muted/80 text-foreground border-border/60 hover:bg-muted",
  gray: "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 border-neutral-500/30",
  brown:
    "bg-amber-600/15 text-amber-800 dark:text-amber-300 border-amber-600/30",
  orange:
    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  yellow:
    "bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-500/30",
  green:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  purple:
    "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
  red: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  size?: "md" | "sm";
}

export function TagBadge({
  tag: initialTag,
  onRemove,
  onClick,
  className,
  size = "md",
}: TagBadgeProps) {
  const storeTag = useTagStore((state) =>
    state.tags.find((t) => t.id === initialTag.id),
  );
  const tag = storeTag || initialTag;
  const colorClass = TAG_COLOR_CLASSES[tag.color] || TAG_COLOR_CLASSES.default;

  return (
    <span
      id={tag.id}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 font-medium transition-all select-none",
        size === "sm" ? "h-5 text-[11px]" : "h-6 text-xs",
        colorClass,
        onClick && "cursor-pointer hover:opacity-85",
        className,
      )}
    >
      <span className="text-[12px]">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 text-current/70 hover:bg-black/10 hover:text-current dark:hover:bg-white/15"
          title="Remove tag"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
