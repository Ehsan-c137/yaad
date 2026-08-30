import { useMemo } from "react";

import type { SearchItem } from "@/types/search";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

/**
 * Hook to perform debounced page search across pages in the active workspace.
 *
 * @param debouncedQuery Cleaned debounced search query.
 * @returns Array of SearchItem matching pages.
 */
export function usePageSearch(debouncedQuery: string): SearchItem[] {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const sidebarPages = useSidebarStore((s) => s.pages);

  return useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();
    if (!trimmedQuery || !activeWorkspaceId) return [];

    const allPages = Object.values(sidebarPages);

    const matches = allPages.filter((page) => {
      const title = (page.title || "Untitled").toLowerCase();
      return title.includes(trimmedQuery);
    });

    return matches.map((page) => {
      let subtitle: string | undefined;

      if (page.parentId) {
        const parentPage = sidebarPages[page.parentId];

        if (parentPage?.title) {
          subtitle = `In ${parentPage.title}`;
        }
      }

      return {
        category: "page" as const,
        icon: page.icon ?? "📄",
        id: `search_page_${page.id}`,
        lastAccessedAt: page.updatedAt,
        pageId: page.id,
        subtitle,
        title: page.title || "Untitled",
        workspaceId: activeWorkspaceId,
      };
    });
  }, [debouncedQuery, activeWorkspaceId, sidebarPages]);
}
