import type { Tag } from "@yaad/core/types/document";
import type { SearchItem } from "@yaad/core/types/search";

import { Eye, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { TagBadge } from "@/components/editor/tags/tag-badge";
import { cn } from "@/lib/utils";

import { BlockPreviewContent } from "./block-preview-content";
import { useBlockPreview } from "./hooks/use-block-preview";

interface BlockPreviewPopoverProps {
  item: SearchItem;
  children: React.ReactNode;
}

export function BlockPreviewPopover({
  item,
  children,
}: BlockPreviewPopoverProps) {
  const { block, isLoading, fetchBlock } = useBlockPreview();

  // --- Desktop popover state ---
  const [showPopover, setShowPopover] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // --- Popover position ---
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    side: "left" | "right";
  } | null>(null);

  // --- Mobile & Desktop inline toggle state ---
  const [showInline, setShowInline] = useState(false);

  const triggerFetch = useCallback(() => {
    fetchBlock(item.pageId, item.blockId);
  }, [fetchBlock, item.pageId, item.blockId]);

  // Calculate popover position based on the row's bounding rect
  const updatePosition = useCallback(() => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const popoverWidth = 288; // w-72 = 18rem = 288px
    const popoverHeight = 220; // approximate popover card height
    const gap = 8;

    // Prefer right side; fall back to left if space is constrained
    const spaceRight = window.innerWidth - rect.right;
    const preferRight = spaceRight >= popoverWidth + gap;

    let left = preferRight ? rect.right + gap : rect.left - popoverWidth - gap;

    // Clamp horizontal position within viewport bounds (16px margin)
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));

    // Clamp vertical position so it doesn't spill off the bottom/top of the screen
    const top = Math.max(
      16,
      Math.min(rect.top, window.innerHeight - popoverHeight - 16),
    );

    setPopoverPos({
      top,
      left,
      side: preferRight ? "right" : "left",
    });
  }, []);

  // Desktop hover handlers
  const handleMouseEnter = useCallback(() => {
    triggerFetch(); // Start fetching block data immediately on enter

    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    hoverTimerRef.current = setTimeout(() => {
      updatePosition();
      setShowPopover(true);
    }, 150);
  }, [triggerFetch, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    leaveTimerRef.current = setTimeout(() => {
      setShowPopover(false);
      setPopoverPos(null);
    }, 150);
  }, []);

  // Keep popover anchored if the list scrolls while hovering
  useEffect(() => {
    if (!showPopover) return;
    const onScroll = () => updatePosition();
    // Listen on the nearest scrollable ancestor
    const scrollParent = rowRef.current?.closest(
      "[data-slot='command-list'], [cmdk-list]",
    );
    scrollParent?.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent?.removeEventListener("scroll", onScroll);
  }, [showPopover, updatePosition]);

  // Toggle inline preview
  const handleToggleInline = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (showInline) {
        setShowInline(false);
      } else {
        triggerFetch();
        setShowInline(true);
      }
    },
    [showInline, triggerFetch],
  );

  // Find tags on the block for display
  const blockTags: Tag[] = block?.tags ?? [];

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      {/* Search result row + Eye toggle button */}
      <div className="flex items-center">
        <div className="min-w-0 flex-1">{children}</div>
        {/* Preview toggle button visible on desktop & mobile */}
        <button
          type="button"
          onClick={handleToggleInline}
          className={cn(
            "mr-2 flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors",
            showInline
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground opacity-70 group-hover:opacity-100",
          )}
          title={showInline ? "Hide block preview" : "Preview block content"}
        >
          <Eye className="size-3.5" />
        </button>
      </div>

      {/* Desktop floating popover â€” rendered via portal to escape overflow-hidden */}
      {showPopover &&
        !showInline &&
        popoverPos &&
        createPortal(
          <div
            className="hidden md:block fixed z-[100]"
            style={{ top: popoverPos.top, left: popoverPos.left }}
            onMouseEnter={() => {
              if (leaveTimerRef.current) {
                clearTimeout(leaveTimerRef.current);
                leaveTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            <PreviewCard
              item={item}
              block={block}
              blockTags={blockTags}
              isLoading={isLoading}
            />
          </div>,
          document.body,
        )}

      {/* Inline expanded preview card (toggled via Eye icon) */}
      {showInline && (
        <div className="px-3 pb-2 pt-1">
          <PreviewCard
            item={item}
            block={block}
            blockTags={blockTags}
            isLoading={isLoading}
            inline
          />
        </div>
      )}
    </div>
  );
}

// --- Shared preview card ---

interface PreviewCardProps {
  item: SearchItem;
  block: import("@yaad/core/types/document").DocumentBlock | null;
  blockTags: Tag[];
  isLoading: boolean;
  inline?: boolean;
}

function PreviewCard({
  item,
  block,
  blockTags,
  isLoading,
  inline = false,
}: PreviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden",
        inline ? "w-full" : "w-72 max-h-56",
        "animate-in fade-in-0 zoom-in-95 duration-150",
      )}
    >
      {/* Header: page title */}
      <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-3 py-1.5">
        <span className="text-xs select-none">{item.icon ?? "ðŸ“„"}</span>
        <span className="truncate text-[11px] font-medium text-muted-foreground">
          {item.title}
        </span>
      </div>

      {/* Body */}
      <div className={cn("px-3 py-2.5", !inline && "max-h-40 overflow-y-auto")}>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : block ? (
          <div className="flex flex-col gap-2">
            <BlockPreviewContent block={block} />
            {blockTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                {blockTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground py-2 text-center">
            Block not found
          </p>
        )}
      </div>
    </div>
  );
}
