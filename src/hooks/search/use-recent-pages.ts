import { useMemo } from "react";

import type { SearchItem } from "@/types/search";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

/**
 *
 * @param limit Maximum number of recent pages to return (default 5).
 * @param workspaceId Optional workspace to scope recents to (defaults to the active workspace).
 * @returns Array of formatted SearchItem objects for recently opened pages.
 */
export function useRecentPages(limit = 5, workspaceId?: string): SearchItem[] {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const tabs = useTabStore((s) => s.tabs);
  const sidebarPages = useSidebarStore((s) => s.pages);

  return useMemo(() => {
    const targetWorkspaceId = workspaceId ?? activeWorkspaceId;
    if (!targetWorkspaceId) return [];

    const workspaceTabs = tabs
      .filter(
        (t) =>
          t.workspaceId === targetWorkspaceId &&
          !sidebarPages[t.pageId]?.isDeleted,
      )
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);

    const recentTabItems: SearchItem[] = workspaceTabs.map((tab) => {
      const pageMeta = sidebarPages[tab.pageId];

      return {
        category: "recent",
        icon: (pageMeta?.icon ?? tab.icon) || "📄",
        id: `recent_${tab.pageId}`,
        lastAccessedAt: tab.lastAccessedAt,
        pageId: tab.pageId,
        title: pageMeta?.title || tab.title || "Untitled",
        workspaceId: targetWorkspaceId,
      };
    });

    const recentPageIds = new Set(recentTabItems.map((item) => item.pageId));

    // If recent tabs are fewer than limit, supplement with pages from sidebar store.
    // Sidebar pages are only loaded for the active workspace, so only fall back
    // when the target workspace is the active one.
    if (
      recentTabItems.length < limit &&
      activeWorkspaceId === targetWorkspaceId
    ) {
      const additionalPages = Object.values(sidebarPages)
        .filter((page) => !page.isDeleted && !recentPageIds.has(page.id))
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, limit - recentTabItems.length)
        .map((page) => ({
          category: "recent" as const,
          icon: page.icon ?? "📄",
          id: `recent_fallback_${page.id}`,
          lastAccessedAt: page.updatedAt,
          pageId: page.id,
          title: page.title || "Untitled",
          workspaceId: targetWorkspaceId,
        }));

      return [...recentTabItems, ...additionalPages].slice(0, limit);
    }

    return recentTabItems.slice(0, limit);
  }, [activeWorkspaceId, tabs, sidebarPages, limit, workspaceId]);
}
