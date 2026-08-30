"use client";

import { Maximize2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { EditorShell } from "../editor-shell";

const DEFAULT_WIDTH = 560;
const MIN_WIDTH = 360;

export function SidePeekPanel() {
  const workspaceId = useWorkspaceStore((store) => store.activeWorkspaceId);
  const { isOpen, peekDocId, closeSidePeek } = useSidePeek();
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const maxWidth = Math.floor(window.innerWidth * 0.5);
    const saved = localStorage.getItem("side-peek-width");

    if (saved) {
      const parsed = Number(saved);

      if (!isNaN(parsed) && parsed > 0) {
        setWidth(
          Math.min(Math.max(parsed, Math.min(MIN_WIDTH, maxWidth)), maxWidth),
        );
        return;
      }
    }

    setWidth(Math.min(DEFAULT_WIDTH, maxWidth));
  }, []);

  // Ensure width adapts if window shrinks below double the current panel width
  useEffect(() => {
    const handleWindowResize = () => {
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      setWidth((prev) => Math.min(prev, maxWidth));
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      const minWidth = Math.min(MIN_WIDTH, maxWidth);
      const calculatedWidth = window.innerWidth - moveEvent.clientX;
      const clampedWidth = Math.min(
        Math.max(calculatedWidth, minWidth),
        maxWidth,
      );
      setWidth(clampedWidth);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      setWidth((currentWidth) => {
        try {
          localStorage.setItem("side-peek-width", currentWidth.toString());
        } catch {
          // Ignore storage errors
        }

        return currentWidth;
      });
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const maxWidth = Math.floor(window.innerWidth * 0.5);
    const minWidth = Math.min(MIN_WIDTH, maxWidth);
    const STEP = 24;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setWidth((prev) => {
        const next = Math.min(prev + STEP, maxWidth);

        try {
          localStorage.setItem("side-peek-width", next.toString());
        } catch {
          console.error("error: saving witdh does not happend");
        }

        return next;
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setWidth((prev) => {
        const next = Math.max(prev - STEP, minWidth);

        try {
          localStorage.setItem("side-peek-width", next.toString());
        } catch {
          console.error("something went wrong");
        }

        return next;
      });
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    const maxWidth = Math.floor(window.innerWidth * 0.5);
    const resetWidth = Math.min(DEFAULT_WIDTH, maxWidth);
    setWidth(resetWidth);

    try {
      localStorage.setItem("side-peek-width", resetWidth.toString());
    } catch (e) {
      console.error(e, "something went wrong");
    }
  }, []);

  if (!isOpen || !peekDocId || !workspaceId) return null;

  return (
    <aside
      style={{ width: `${width}px`, maxWidth: "50vw" }}
      className={cn(
        "relative inset-y-0 right-0 z-40 flex h-full shrink-0 flex-col border-l border-border bg-background shadow-2xl",
        !isDragging && "transition-[width] duration-150 ease-out",
        "animate-in duration-200 slide-in-from-right",
      )}
    >
      {/* Draggable Resize Handle */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Resize side peek panel"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={
          typeof window !== "undefined"
            ? Math.floor(window.innerWidth * 0.5)
            : DEFAULT_WIDTH
        }
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute inset-y-0 -left-2 z-50 w-4 cursor-col-resize select-none",
          "group flex items-center justify-center focus:outline-none",
        )}
        title="Drag to resize (Max: 50% of screen), double-click to reset"
      >
        <div
          className={cn(
            "h-8 w-1 rounded-full bg-border transition-all duration-150 group-hover:h-12 group-hover:w-1.5 group-hover:bg-primary/70",
            isDragging && "h-14 w-1.5 bg-primary",
          )}
        />
      </div>

      <div className="flex h-12 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Side Peek</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/workspace/${workspaceId}/${peekDocId}`}
            className="inline-flex size-6 items-center justify-center rounded-xl text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
            title="Open full page"
          >
            <Maximize2 className="size-3.5" />
          </Link>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={closeSidePeek}
            title="Close side peek"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Independent Editor Surface for the Side Document */}
      <div className="flex-1 overflow-y-auto">
        <EditorShell pageId={peekDocId} />
      </div>
    </aside>
  );
}
