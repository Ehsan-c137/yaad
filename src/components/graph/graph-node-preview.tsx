"use client";

import { ExternalLink, FileText, SidebarOpen, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { cn } from "@/lib/utils";

interface GraphNodePreviewProps {
  pageId: string;
  title: string;
  icon?: string;
  workspaceId: string;
  /** Position in viewport pixels where the preview should anchor (node center) */
  anchorX: number;
  anchorY: number;
  onClose: () => void;
}

export function GraphNodePreview({
  pageId,
  title,
  icon,
  workspaceId,
  anchorX,
  anchorY,
  onClose,
}: GraphNodePreviewProps) {
  const { openSidePeek } = useSidePeek();
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay so the node click that opened the preview doesn't immediately close it
    const id = setTimeout(
      () => document.addEventListener("mousedown", onClick),
      50,
    );

    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  const hasIcon = Boolean(icon && icon !== "📄");

  const handleOpenSidePeek = () => {
    openSidePeek(pageId);
    onClose();
  };

  // Clamp position so preview stays within viewport
  const previewWidth = 260;
  const previewHeight = 140;
  const left = Math.min(
    Math.max(anchorX - previewWidth / 2, 8),
    window.innerWidth - previewWidth - 8,
  );
  const top = anchorY + 16; // 16px below node

  // If too close to bottom, flip above
  const flipUp = top + previewHeight > window.innerHeight - 16;
  const finalTop = flipUp ? anchorY - previewHeight - 16 : top;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Preview: ${title}`}
      style={{
        position: "fixed",
        left,
        top: finalTop,
        width: previewWidth,
        zIndex: 100,
      }}
      className={cn(
        "rounded-2xl border border-border/70 bg-popover/95 p-4 shadow-2xl backdrop-blur-xl",
        "animate-in duration-150 fade-in-0 zoom-in-95",
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-lg leading-none">
          {hasIcon ? (
            <span role="img">{icon}</span>
          ) : (
            <FileText
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {title || "Untitled"}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {pageId}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={handleOpenSidePeek}
        >
          <SidebarOpen className="size-3.5" />
          Side Peek
        </Button>
        <Link
          href={`/workspace/${workspaceId}/${pageId}`}
          onClick={onClose}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5",
            "bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          )}
        >
          <ExternalLink className="size-3.5" />
          Open Page
        </Link>
      </div>
    </div>
  );
}
