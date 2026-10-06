import type { SearchItem } from "@yaad/core/types/search";

import type { SearchPageMeta } from "./search-types";

export function getRecentPages(
  pages: Record<string, SearchPageMeta | undefined>,
  limit: number,
): SearchItem[] {
  return Object.values(pages)
    .filter((page): page is SearchPageMeta => Boolean(page))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, limit)
    .map((page) => ({
      id: page.id,
      pageId: page.id,
      workspaceId: "",
      category: "recent" as const,
      title: page.title || "Untitled",
      icon: page.icon ?? "📄",
    }));
}
