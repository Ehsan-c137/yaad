import type { SearchItem } from "@yaad/core/types/search";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useEffect, useMemo, useState } from "react";

export function usePageSearch(
  debouncedQuery: string,
  selectedTagId?: string | null,
): SearchItem[] {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const pages = useSidebarStore((s) => s.pages);
  const [indexedResults, setIndexedResults] = useState<SearchItem[]>([]);

  const pageResults = useMemo(() => {
    if (!activeWorkspaceId) return [];

    const rawQuery = debouncedQuery.trim();
    const isHashtag = rawQuery.startsWith("#");
    const cleanedQuery = (
      isHashtag ? rawQuery.slice(1).trim() : rawQuery
    ).toLowerCase();

    if (!cleanedQuery && !selectedTagId) return [];

    const results: SearchItem[] = [];

    for (const page of Object.values(pages)) {
      if (!page || page.isDeleted) continue;

      const title = page.title || "Untitled";

      if (
        !selectedTagId &&
        (!cleanedQuery || title.toLowerCase().includes(cleanedQuery))
      ) {
        const parentPage = page.parentId ? pages[page.parentId] : null;

        results.push({
          id: `search_page_${page.id}`,
          pageId: page.id,
          category: "page",
          title,
          subtitle: parentPage
            ? `In ${parentPage.title || "Untitled"}`
            : undefined,
          icon: page.icon || "📄",
          workspaceId: activeWorkspaceId,
          lastAccessedAt: page.updatedAt ?? 1,
        });
      }
    }

    return results;
  }, [debouncedQuery, selectedTagId, activeWorkspaceId, pages]);

  useEffect(() => {
    let cancelled = false;

    async function loadTaggedBlocks() {
      if (!activeWorkspaceId || !storage.getTagsIndex) {
        setIndexedResults([]);
        return;
      }

      const rawQuery = debouncedQuery.trim();
      const cleanedQuery = (
        rawQuery.startsWith("#") ? rawQuery.slice(1).trim() : rawQuery
      ).toLowerCase();

      if (!cleanedQuery && !selectedTagId) {
        setIndexedResults([]);
        return;
      }

      const records = await storage.getTagsIndex(selectedTagId ?? undefined);
      const results: SearchItem[] = [];
      const seen = new Set<string>();

      for (const record of records) {
        const page = pages[record.pageId];
        if (!page || page.isDeleted) continue;

        const pageTitle = page.title || "Untitled";
        const matchesQuery =
          !cleanedQuery ||
          pageTitle.toLowerCase().includes(cleanedQuery) ||
          (record.snippet || "").toLowerCase().includes(cleanedQuery);

        if (!matchesQuery) continue;

        const resultId = `${record.pageId}_${record.blockId}`;
        if (seen.has(resultId)) continue;
        seen.add(resultId);

        results.push({
          id: `search_block_${resultId}`,
          pageId: record.pageId,
          blockId: record.blockId,
          blockType: record.blockType,
          category: "block",
          title: pageTitle,
          subtitle: record.snippet
            ? `${record.blockType}: ${record.snippet}`
            : `${record.blockType} block`,
          icon: page.icon || "📄",
          workspaceId: activeWorkspaceId,
          lastAccessedAt: record.updatedAt,
        });
      }

      if (!cancelled) setIndexedResults(results);
    }

    void loadTaggedBlocks();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selectedTagId, activeWorkspaceId, pages]);

  return useMemo(() => {
    const results = [...pageResults];
    const seen = new Set(results.map((result) => result.id));

    for (const result of indexedResults) {
      if (!seen.has(result.id)) results.push(result);
    }

    return results;
  }, [pageResults, indexedResults]);
}
