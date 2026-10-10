import type { TagIndexRecord } from "@yaad/core/lib/storage/types";
import type { SearchItem } from "@yaad/core/types/search";

import type { SearchPageMeta, SearchTagIndexReader } from "./search-types";

export interface SearchPagesOptions {
  pages: Record<string, SearchPageMeta | undefined>;
  query: string;
  tagId?: string | null;
  tagIndexReader?: SearchTagIndexReader;
  workspaceId: string;
}

export interface SearchBlocksByTagOptions {
  indexRecords: TagIndexRecord[];
  pages: Record<string, SearchPageMeta | undefined>;
  query: string;
  workspaceId: string;
}

export function searchPagesByTitle(
  pages: Record<string, SearchPageMeta | undefined>,
  query: string,
  workspaceId: string,
): SearchItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedPages: SearchItem[] = [];
  const seenItemKeys = new Set<string>();

  for (const page of Object.values(pages)) {
    if (!page || page.isDeleted) continue;

    const title = page.title || "Untitled";
    const matches =
      !normalizedQuery || title.toLowerCase().includes(normalizedQuery);

    if (matches && !seenItemKeys.has(page.id)) {
      seenItemKeys.add(page.id);
      matchedPages.push({
        id: page.id,
        pageId: page.id,
        workspaceId,
        category: "page",
        title,
        icon: page.icon ?? "📄",
      });
    }
  }

  return matchedPages;
}

export function searchBlocksByTag({
  indexRecords,
  pages,
  query,
  workspaceId,
}: SearchBlocksByTagOptions): SearchItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedBlocks: SearchItem[] = [];
  const seenItemKeys = new Set<string>();

  for (const record of indexRecords) {
    const pageMeta = pages[record.pageId];
    if (!pageMeta || pageMeta.isDeleted) continue;
    const pageTitle = pageMeta.title || "Untitled Page";
    const snippet = record.snippet ?? "";

    const matches =
      !normalizedQuery ||
      pageTitle.toLowerCase().includes(normalizedQuery) ||
      snippet.toLowerCase().includes(normalizedQuery);

    if (matches) {
      const itemKey = `${record.pageId}_${record.blockId}`;

      if (!seenItemKeys.has(itemKey)) {
        seenItemKeys.add(itemKey);
        matchedBlocks.push({
          id: itemKey,
          pageId: record.pageId,
          blockId: record.blockId,
          blockType: record.blockType,
          workspaceId,
          category: "block",
          title: pageTitle,
          subtitle: snippet
            ? `${record.blockType}: ${snippet}`
            : `${record.blockType} block`,
          icon: pageMeta.icon ?? "📄",
        });
      }
    }
  }

  return matchedBlocks;
}

/**
 * Composable function to search pages or tag-filtered blocks.
 */
export async function searchPages({
  pages,
  query,
  tagId,
  tagIndexReader,
  workspaceId,
}: SearchPagesOptions): Promise<SearchItem[]> {
  if (tagId && tagIndexReader?.getTagsIndex) {
    const indexRecords = await tagIndexReader.getTagsIndex(tagId);

    return searchBlocksByTag({
      indexRecords,
      pages,
      query,
      workspaceId,
    });
  }

  return searchPagesByTitle(pages, query, workspaceId);
}
