"use client";

import type React from "react";

import { Button } from "@ui/button";
import { ChevronRight, Plus } from "lucide-react";

import type { SidebarPageItem as SidebarPageItemType } from "@/store/use-sidebar-store";

import { useSidebarPageItem } from "@/hooks/sidebar/use-sidebar-page-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SidebarItemOptions } from "./sidebar-item-options";

interface SidebarPageItemProps {
  pageId: string;
  depth?: number;
}

interface SidebarPageHeaderProps {
  pageId: string;
  page: SidebarPageItemType;
  isActive: boolean;
  hasChildren: boolean;
  isMobile: boolean;
  onNavigate: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}

function getIndentStyle(depth: number): React.CSSProperties {
  return {
    paddingLeft: depth === 0 ? "4px" : `${depth * 8 + 12}px`,
  };
}

export function SidebarPageItem({ pageId, depth = 0 }: SidebarPageItemProps) {
  const {
    page,
    isActive,
    hasChildren,
    handleNavigate,
    handleToggleExpand,
    handleCreateSubpage,
  } = useSidebarPageItem(pageId);
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
        style={getIndentStyle(depth)}
      >
        <SidebarPageHeader
          pageId={pageId}
          page={page}
          isActive={isActive}
          hasChildren={hasChildren}
          isMobile={isMobile}
          onNavigate={handleNavigate}
          onToggleExpand={handleToggleExpand}
        />

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
            <SidebarItemOptions pageId={pageId} />
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              title="Add sub-page"
              aria-label="Add sub-page"
              onClick={handleCreateSubpage}
              className="size-5 rounded-sm p-0 text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {page.isExpanded && hasChildren && (
        <div id={`children-${pageId}`} className="flex w-full flex-col">
          {page.childrenIds.map((childId) => (
            <SidebarPageItem key={childId} pageId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarPageHeader({
  pageId,
  page,
  isActive,
  hasChildren,
  isMobile,
  onNavigate,
  onToggleExpand,
}: SidebarPageHeaderProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onToggleExpand}
        aria-label={page.isExpanded ? "Collapse" : "Expand"}
        aria-expanded={page.isExpanded}
        aria-controls={`children-${pageId}`}
        className={cn(
          "relative z-10 shrink-0 rounded-sm",
          "text-muted-foreground",
          styles.spring,
          hasChildren ? "visible" : "pointer-events-none invisible",
          page.isExpanded && "rotate-90",
          isActive ? "text-(--accent-blue)" : "",
        )}
      >
        <ChevronRight className="size-3.5" />
      </Button>

      <span className="mr-1.5 shrink-0 text-lg">
        {page.icon ?? <span className="inline-block size-3.5" />}
      </span>

      <Button
        type="button"
        variant="ghost"
        onClick={onNavigate}
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
    </>
  );
}
