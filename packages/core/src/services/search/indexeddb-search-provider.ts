import type {
  SearchItem,
  SearchOptions,
  SearchProvider,
  SearchResponse,
} from "@yaad/core/types/search";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTagStore } from "@yaad/core/store/use-tag-store";

export class IndexedDbSearchProvider implements SearchProvider {
  async search({
    query,
    tagId,
    workspaceId,
  }: SearchOptions): Promise<SearchResponse> {
    const q = (query || "").trim().toLowerCase();
    const sidebarPages = useSidebarStore.getState().pages;
    const allTags = useTagStore.getState().tags;
    console.log({ storage, allTags });
    // 1. Tag Results (Matching tag names + tagged block count from storage index)
    const matchedTags: SearchItem[] = [];

    if (q) {
      for (const tag of allTags) {
        if (tag.name.toLowerCase().includes(q)) {
          let records: (import("../../lib/storage/types").TagIndexRecord & {
            pageTitle?: string;
          })[] = [];

          if (storage.getTagsIndex) {
            const rawRecords = await storage.getTagsIndex(tag.id);
            records = rawRecords.map((r) => ({
              ...r,
              pageTitle: sidebarPages[r.pageId]?.title,
            }));
          }

          // Fallback: If index is empty, check active documents in storage/store for tagged blocks
          if (records.length === 0) {
            for (const pageMeta of Object.values(sidebarPages)) {
              if (!pageMeta) continue;

              try {
                const doc = await storage.getDocument(pageMeta.id);

                if (doc?.blocks) {
                  for (const block of Object.values(doc.blocks)) {
                    if (block.tags?.some((t) => t.id === tag.id)) {
                      let snippet = "";

                      if (
                        block.properties?.title &&
                        Array.isArray(block.properties.title)
                      ) {
                        snippet = block.properties.title
                          .map((s: any) => s.text || "")
                          .join("");
                      } else if (typeof block.properties?.code === "string") {
                        snippet = block.properties.code;
                      } else if (
                        typeof block.properties?.caption === "string"
                      ) {
                        snippet = block.properties.caption;
                      }

                      records.push({
                        tagId: tag.id,
                        pageId: doc.id,
                        blockId: block.id,
                        blockType: block.type,
                        snippet: snippet.slice(0, 150),
                        updatedAt: doc.updatedAt || Date.now(),
                        pageTitle: pageMeta.title,
                      });
                    }
                  }
                }
              } catch {
                // ignore document read errors in search
              }
            }
          }

          const count = records.length;
          const firstRecord = records[0];
          const pageId =
            firstRecord?.pageId || tag.pageId || tag.metadata?.pageId || "";
          const blockId =
            firstRecord?.blockId || tag.blockId || tag.metadata?.blockId;
          const pageTitle =
            firstRecord?.pageTitle ||
            (pageId ? sidebarPages[pageId]?.title : undefined);

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
              pageTitle,
              locations: records.map((r) => ({
                pageId: r.pageId,
                blockId: r.blockId,
                blockType: r.blockType,
                snippet: r.snippet,
                updatedAt: r.updatedAt,
                pageTitle: r.pageTitle || sidebarPages[r.pageId]?.title,
              })),
            },
          };

          matchedTags.push({
            id: tag.id,
            pageId,
            blockId,
            blockType: firstRecord?.blockType,
            workspaceId: workspaceId || "",
            category: "tag" as const,
            title: `#${tag.name}`,
            subtitle: firstRecord?.snippet
              ? firstRecord.snippet
              : count > 0
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
      // 3. General Page Title Search
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

  async getRecentPages(limit: number): Promise<SearchItem[]> {
    const sidebarPages = useSidebarStore.getState().pages;
    const pagesArray = Object.values(sidebarPages).filter(
      (p): p is NonNullable<typeof p> => Boolean(p),
    );

    return pagesArray
      .slice(0, limit)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
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
