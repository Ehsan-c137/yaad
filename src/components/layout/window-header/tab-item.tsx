"use client";

import { Button } from "@ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@ui/context-menu";
import {
  ArrowRightToLine,
  Copy,
  ExternalLink,
  FileText,
  Pin,
  PinOff,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { TabItem as TabItemType } from "@/store/use-tab-store";

import { ROUTES } from "@/constants/routes";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/use-tab-store";

interface TabItemProps {
  tab: TabItemType;
  isActive: boolean;
}

export function TabItem({ tab, isActive }: TabItemProps) {
  const router = useRouter();
  const closeTab = useTabStore((s) => s.closeTab);

  const setActiveTabId = useTabStore((s) => s.setActiveTabId);

  const handleSelectTab = () => {
    setActiveTabId(tab.id);
    router.push(`/${ROUTES.workspace}/${tab.workspaceId}/${tab.pageId}`);
  };

  const handleClose = (
    e: React.KeyboardEvent<HTMLSpanElement> | React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    closeTab(tab.id, router);
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    // Middle-click closes tab (button === 1)
    if (e.button === 1) {
      e.stopPropagation();
      e.preventDefault();
      closeTab(tab.id, router);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <Button
            role="tab"
            variant="outline"
            aria-selected={isActive}
            tabIndex={0}
            onClick={handleSelectTab}
            onAuxClick={handleAuxClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectTab();
              } else if (e.key === "w" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                closeTab(tab.id, router);
              }
            }}
            className={cn(
              "group relative flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium select-none",
              "transition-all duration-(--press-duration) ease-(--spring)",
              "border border-transparent",
              tab.isPinned ? "max-w-30 min-w-fit" : "mmax-w-47.5 min-w-27.5",
              isActive
                ? "border-border/60 bg-background text-foreground shadow-xs dark:border-white/10 dark:bg-card/70"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/6",
            )}
            title={tab.title}
            tooltipSide="bottom"
          />
        }
      >
        {/* Tab Icon / Pinned indicator */}
        <span className="flex size-4 shrink-0 items-center justify-center text-xs">
          {tab.isPinned ? (
            <Pin className="size-3 rotate-45 text-(--accent-blue)" />
          ) : tab.icon ? (
            <span className="text-xs leading-none">{tab.icon}</span>
          ) : (
            <FileText className="size-3.5 text-muted-foreground group-hover:text-foreground" />
          )}
        </span>

        {/* Tab Title */}
        <span className="flex-1 truncate text-left tracking-tight">
          {tab.title || "Untitled"}
        </span>

        {/* Close button (only shown if not pinned) */}
        {!tab.isPinned && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClose}
            onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleClose(e);
              }
            }}
            aria-label="Close tab"
            title="Close tab (Middle click)"
            className={cn(
              "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm p-0 text-muted-foreground/60 transition-opacity hover:bg-foreground/10 hover:text-foreground",
              isActive
                ? "opacity-80 group-hover:opacity-100"
                : "opacity-0 group-hover:opacity-80 focus:opacity-100",
            )}
          >
            <X className="size-3" />
          </span>
        )}

        {isActive && (
          <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-(--accent-blue)" />
        )}
      </ContextMenuTrigger>
      <MenuContent tab={tab} handleClose={handleClose} />
    </ContextMenu>
  );
}

function MenuContent({
  tab,
  handleClose,
}: {
  tab: TabItemType;
  handleClose: (
    e: React.KeyboardEvent<HTMLSpanElement> | React.MouseEvent,
  ) => void;
}) {
  const router = useRouter();
  const closeOtherTabs = useTabStore((s) => s.closeOtherTabs);
  const closeTabsToRight = useTabStore((s) => s.closeTabsToRight);
  const togglePinTab = useTabStore((s) => s.togglePinTab);

  const handleOpenBrowserTab = () => {
    const url = `/${ROUTES.workspace}/${tab.workspaceId}/${tab.pageId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/${ROUTES.workspace}/${tab.workspaceId}/${tab.pageId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Page link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <ContextMenuContent className={`${styles.menu} w-52 text-xs`} align="start">
      <ContextMenuItem onClick={handleClose}>
        <X className="size-3.5 text-muted-foreground" />
        <span>Close tab</span>
        <ContextMenuShortcut>⌘W</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => closeOtherTabs(tab.id, router)}>
        <span>Close other tabs</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => closeTabsToRight(tab.id, router)}>
        <ArrowRightToLine className="size-3.5 text-muted-foreground" />
        <span>Close tabs to right</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={() => togglePinTab(tab.id)}>
        {tab.isPinned ? (
          <>
            <PinOff className="size-3.5 text-muted-foreground" />
            <span>Unpin tab</span>
          </>
        ) : (
          <>
            <Pin className="size-3.5 text-muted-foreground" />
            <span>Pin tab</span>
          </>
        )}
      </ContextMenuItem>

      <ContextMenuItem onClick={handleOpenBrowserTab}>
        <ExternalLink className="size-3.5 text-muted-foreground" />
        <span>Open in browser tab</span>
      </ContextMenuItem>

      <ContextMenuItem onClick={handleCopyLink}>
        <Copy className="size-3.5 text-muted-foreground" />
        <span>Copy link</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
