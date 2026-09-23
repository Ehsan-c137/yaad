import type {
  SearchItem,
  SearchOptions,
  SearchProvider,
  SearchResponse,
} from "@yaad/core/types/search";

import { invoke } from "@tauri-apps/api/core";
import { storage } from "@yaad/core/lib/storage/storage-provider";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTagStore } from "@yaad/core/store/use-tag-store";

export class TauriSearchProvider implements SearchProvider {
  async search({
    query,
    tagId,
    workspaceId,
  }: SearchOptions): Promise<SearchResponse> {
    try {
      return await invoke<SearchResponse>("search_workspace_pages", {
        query,
        tagId,
        workspaceId,
      });
    } catch {
      const q = (query || "").trim().toLowerCase();
      const sidebarPages = useSidebarStore.getState().pages;
      const allTags = useTagStore.getState().tags;

      const matchedTags: SearchItem[] = [];

      if (q) {
        for (const tag of allTags) {
          if (tag.name.toLowerCase().includes(q)) {
            let count = 0;
            let records: import("../../lib/storage/types").TagIndexRecord[] =
              [];

            if (storage.getTagsIndex) {
              records = await storage.getTagsIndex(tag.id);
              count = records.length;
            }

            const firstRecord = records[0];
            const pageId =
              firstRecord?.pageId || tag.pageId || tag.metadata?.pageId || "";
            const blockId =
              firstRecord?.blockId || tag.blockId || tag.metadata?.blockId;

            const tagWithMeta = {
              ...tag,
              pageId: pageId || tag.pageId,
              blockId: blockId || tag.blockId,
              metadata: {
                ...tag.metadata,
                pageId: pageId || tag.metadata?.pageId,
                blockId: blockId || tag.metadata?.blockId,
                blockType: firstRecord?.blockType || tag.metadata?.blockType,
                snippet: firstRecord?.snippet || tag.metadata?.snippet,
                updatedAt: firstRecord?.updatedAt || tag.metadata?.updatedAt,
                locations: records.map((r) => ({
                  pageId: r.pageId,
                  blockId: r.blockId,
                  blockType: r.blockType,
                  snippet: r.snippet,
                  updatedAt: r.updatedAt,
                })),
              },
            };

            matchedTags.push({
              id: `tag_${tag.id}`,
              pageId,
              blockId,
              blockType: firstRecord?.blockType,
              workspaceId: workspaceId || "",
              category: "tag" as const,
              title: `#${tag.name}`,
              subtitle:
                count > 0
                  ? `${count} tagged block${count > 1 ? "s" : ""}`
                  : "Filter pages by tag",
              tag: tagWithMeta,
            });
          }
        }
      }

      const matchedPages: SearchItem[] = [];
      const seenItemKeys = new Set<string>();

      if (tagId && storage.getTagsIndex) {
        const indexRecords = await storage.getTagsIndex(tagId);

        for (const record of indexRecords) {
          const pageMeta = sidebarPages[record.pageId];
          const pageTitle = pageMeta?.title || "Untitled Page";
          const matchesQuery =
            !q ||
            pageTitle.toLowerCase().includes(q) ||
            (record.snippet || "").toLowerCase().includes(q);

          if (matchesQuery) {
            const itemKey = `${record.pageId}_${record.blockId}`;

            if (!seenItemKeys.has(itemKey)) {
              seenItemKeys.add(itemKey);
              matchedPages.push({
                id: itemKey,
                pageId: record.pageId,
                blockId: record.blockId,
                blockType: record.blockType,
                workspaceId: workspaceId || "",
                category: "block",
                title: pageTitle,
                subtitle: record.snippet
                  ? `${record.blockType}: ${record.snippet}`
                  : `${record.blockType} block`,
                icon: pageMeta?.icon || "📄",
              });
            }
          }
        }
      } else {
        for (const page of Object.values(sidebarPages)) {
          if (!page) continue;
          if (!q || (page.title || "").toLowerCase().includes(q)) {
            if (!seenItemKeys.has(page.id)) {
              seenItemKeys.add(page.id);
              matchedPages.push({
                id: page.id,
                pageId: page.id,
                workspaceId: workspaceId || "",
                category: "page",
                title: page.title || "Untitled",
                icon: page.icon || "📄",
              });
            }
          }
        }
      }

      return {
        pages: matchedPages,
        tags: matchedTags,
      };
    }
  }

  async getRecentPages(limit: number): Promise<SearchItem[]> {
    try {
      return await invoke<SearchItem[]>("get_recent_pages", { limit });
    } catch {
      const sidebarPages = useSidebarStore.getState().pages;
      return Object.values(sidebarPages)
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .slice(0, limit)
        .map((page) => ({
          id: page.id,
          pageId: page.id,
          workspaceId: "",
          category: "recent",
          title: page.title || "Untitled",
          icon: page.icon || "📄",
        }));
    }
  }
}
