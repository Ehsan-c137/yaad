"use client";

import { Button } from "@ui/button";
import { BookmarkCheck } from "lucide-react";

import { useSidebarPageItem } from "@/hooks/sidebar/use-sidebar-page-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarItemOptions } from "../home/sidebar-item/sidebar-item-options";

interface SidebarBookmarkItemProps {
  pageId: string;
}

export function SidebarBookmarkItem({ pageId }: SidebarBookmarkItemProps) {
  const { page, isActive, handleNavigate } = useSidebarPageItem(pageId);
  const toggleBookmarked = useSidebarStore((s) => s.toggleBookmarked);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!page) return null;

  return (
    <div className="flex w-full flex-col select-none">
      <div
        className={cn(
          "group relative flex w-full items-center",
          "my-px rounded-full px-2",
          "transition-colors duration-(--press-duration) ease-(--spring)",
          isActive
            ? "bg-(--accent-blue-tint)"
            : "hover:bg-foreground/5 dark:hover:bg-white/6",
        )}
      >
        <span className="mr-1.5 ml-1 shrink-0 text-lg">
          {page.icon ?? <span className="inline-block size-3.5" />}
        </span>

        <Button
          type="button"
          variant="ghost"
          onClick={handleNavigate}
          className={cn(
            "h-auto flex-1 justify-start truncate rounded-sm py-1.5 text-start text-sm font-normal",
            isMobile ? "flex min-h-11 items-center" : "min-h-7",
            isActive
              ? "font-medium text-(--accent-blue)"
              : "text-muted-foreground group-hover:text-foreground",
            "transition-colors duration-(--press-duration) ease-(--spring)",
          )}
        >
          {page.title || "Untitled"}
        </Button>

        {isMobile ? (
          <div className="shrink-0 pr-0.5">
            <SidebarItemOptions pageId={pageId} />
          </div>
        ) : (
          <div
            className={cn(
              "ml-auto flex shrink-0 items-center gap-0.5 pr-0.5",
              "opacity-0 transition-opacity duration-(--press-duration)",
              "group-focus-within:opacity-100 group-hover:opacity-100",
            )}
          >
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              title="Remove from bookmarks"
              aria-label="Remove from bookmarks"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmarked(pageId);
              }}
              className="size-5 rounded-sm p-0 text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
            >
              <BookmarkCheck className="size-3.5 text-(--accent-blue)" />
            </Button>
            <SidebarItemOptions pageId={pageId} />
          </div>
        )}
      </div>
    </div>
  );
}
