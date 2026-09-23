import type { SearchItem } from "@yaad/core/types/search";

import { useTagStore } from "@yaad/core/store/use-tag-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useMemo } from "react";

export function useTagSearch(query: string): SearchItem[] {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const tags = useTagStore((s) => s.tags);

  return useMemo(() => {
    let trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery.startsWith("#")) {
      trimmedQuery = trimmedQuery.slice(1).trim();
    }

    if (!trimmedQuery) {
      return [];
    }

    return tags
      .filter((tag) => tag.name.toLowerCase().includes(trimmedQuery))
      .map((tag) => ({
        id: tag.id,
        pageId: "",
        workspaceId: activeWorkspaceId ?? "",
        category: "tag" as const,
        title: `#${tag.name}`,
        subtitle: "Filter pages by tag",
        tag,
      }));
  }, [query, tags, activeWorkspaceId]);
}
