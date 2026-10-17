/* eslint-disable @typescript-eslint/strict-void-return */
"use client";

import type { SidebarPageItem as SidebarPageItemType } from "@yaad/core/store/use-sidebar-store";
import type React from "react";

import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSidebarPageDnd } from "@/hooks/sidebar/use-sidebar-dnd";
import { useSidebarPageItem } from "@/hooks/sidebar/use-sidebar-page-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";
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
    paddingInlineStart: depth === 0 ? "4px" : `${depth * 8 + 12}px`,
  };
}

export function SidebarPageItem({ pageId, depth = 0 }: SidebarPageItemProps) {
  const { t } = useTranslation(["sidebar", "common"]);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { isReadOnly } = useWorkspacePermissions(activeWorkspaceId);
  const {
    page,
    isActive,
    hasChildren,
    handleNavigate,
    handleToggleExpand,
    handleCreateSubpage,
  } = useSidebarPageItem(pageId);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const {
    isDragging,
    isDropTarget,
    activePosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useSidebarPageDnd(pageId, isReadOnly);

  if (!page || page.isDeleted) return null;

  return (
    <div className="flex w-full flex-col select-none min-h-0 max-h-auto">
      <div
        data-testid={`sidebar-page-item-${pageId}`}
        draggable={!isReadOnly}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex w-full items-center",
          "my-px rounded-full px-2",
          "transition-colors duration-(--press-duration) ease-(--spring)",
          isActive
            ? "bg-(--accent-blue-tint)"
            : "hover:bg-foreground/5 dark:hover:bg-white/6",
          isDragging &&
            "opacity-40 scale-[0.98] border border-dashed border-primary/40",
          isDropTarget &&
            activePosition === "inside" &&
            "ring-2 ring-(--accent-blue) bg-(--accent-blue-tint) shadow-xs",
        )}
        style={getIndentStyle(depth)}
      >
        {isDropTarget && activePosition === "before" && (
          <div
            data-testid="drop-indicator-before"
            className="pointer-events-none absolute -top-0.5 start-1 end-1 z-30 flex items-center"
          >
            <div className="size-1.5 rounded-full bg-(--accent-blue) ring-2 ring-background" />
            <div className="h-0.5 flex-1 rounded-full bg-(--accent-blue) shadow-[0_0_6px_var(--accent-blue)]" />
          </div>
        )}

        {isDropTarget && activePosition === "after" && (
          <div
            data-testid="drop-indicator-after"
            className="pointer-events-none absolute -bottom-0.5 start-1 end-1 z-30 flex items-center"
          >
            <div className="size-1.5 rounded-full bg-(--accent-blue) ring-2 ring-background" />
            <div className="h-0.5 flex-1 rounded-full bg-(--accent-blue) shadow-[0_0_6px_var(--accent-blue)]" />
          </div>
        )}

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
          <div
            className="shrink-0 pe-0.5"
            draggable={false}
            onDragStart={(e) => e.stopPropagation()}
          >
            <SidebarItemOptions pageId={pageId} />
          </div>
        ) : (
          <div
            draggable={false}
            onDragStart={(e) => e.stopPropagation()}
            className={cn(
              "ms-auto flex shrink-0 items-center gap-0.5 pe-0.5",
              "opacity-0 transition-opacity duration-(--press-duration)",
              "group-focus-within:opacity-100 group-hover:opacity-100",
            )}
          >
            <SidebarItemOptions pageId={pageId} />

            {!isReadOnly && (
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                title={t("sidebar:addSubPage")}
                aria-label={t("sidebar:addSubPage")}
                onClick={handleCreateSubpage}
                draggable={false}
                onDragStart={(e) => e.stopPropagation()}
                className="size-5 rounded-sm p-0 text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          id={`children-${pageId}`}
          aria-hidden={!page.isExpanded}
          className={cn(
            "grid w-full transition-[grid-template-rows,opacity] duration-(--spring-duration) ease-(--spring)",
            page.isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none",
          )}
        >
          <div className="overflow-hidden flex flex-col">
            {page.childrenIds.map((childId) => (
              <SidebarPageItem
                key={childId}
                pageId={childId}
                depth={depth + 1}
              />
            ))}
          </div>
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
  const { t } = useTranslation(["editor", "common"]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        draggable={false}
        onDragStart={(e) => e.stopPropagation()}
        onClick={onToggleExpand}
        aria-label={
          page.isExpanded
            ? t("editor:collapseToggle")
            : t("editor:expandToggle")
        }
        aria-expanded={page.isExpanded}
        aria-controls={`children-${pageId}`}
        className={cn(
          "relative z-10 shrink-0 rounded-full",
          "text-muted-foreground",
          hasChildren ? "visible" : "pointer-events-none invisible",
          isActive ? "text-(--accent-blue)" : "",
        )}
      >
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform duration-(--spring-duration) ease-(--spring)",
            page.isExpanded && "rotate-90 rtl:-rotate-90",
          )}
        />
      </Button>

      <span className="me-1.5 shrink-0 text-lg">
        {page.icon ?? <span className="inline-block size-3.5" />}
      </span>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate()}
        className={cn(
          "h-auto flex-1 justify-start truncate rounded-sm py-1.5 text-start text-sm font-normal",
          isMobile ? "flex min-h-11 items-center" : "min-h-7",
          isActive
            ? "font-medium text-(--accent-blue)"
            : "text-muted-foreground group-hover:text-foreground",
          "transition-colors duration-(--press-duration) ease-(--spring)",
        )}
      >
        {page.title || t("common:untitled")}
      </Button>
    </>
  );
}
