import type { TagIndexRecord } from "@yaad/core/lib/storage/types";
import type { Tag, TagMetadata } from "@yaad/core/types/document";
import type { SearchItem } from "@yaad/core/types/search";

import type {
  BlockSnippetExtractor,
  SearchDocumentReader,
  SearchPageMeta,
  SearchTagIndexReader,
} from "./search-types";

import { extractBlockSnippet } from "./snippet-extractor";

export type EnrichedTagRecord = TagIndexRecord & { pageTitle?: string };

export interface SearchTagsOptions {
  documentReader?: SearchDocumentReader;
  extractSnippet?: BlockSnippetExtractor;
  pages: Record<string, SearchPageMeta | undefined>;
  query: string;
  tagIndexReader?: SearchTagIndexReader;
  tags: Tag[];
  workspaceId: string;
}

export interface ScanDocumentsForTagOptions {
  documentReader?: SearchDocumentReader;
  pages: Record<string, SearchPageMeta | undefined>;
  snippetExtractor?: BlockSnippetExtractor;
  tagId: string;
}

export interface ResolveTagRecordsOptions {
  documentReader?: SearchDocumentReader;
  pages: Record<string, SearchPageMeta | undefined>;
  snippetExtractor?: BlockSnippetExtractor;
  tagId: string;
  tagIndexReader?: SearchTagIndexReader;
}

interface BuildTagItemOptions {
  pages: Record<string, SearchPageMeta | undefined>;
  records: EnrichedTagRecord[];
  tag: Tag;
  workspaceId: string;
}

interface TagMetadataContext {
  coords: { blockId?: string; pageId: string; pageTitle?: string };
  firstRecord: EnrichedTagRecord | undefined;
  pages: Record<string, SearchPageMeta | undefined>;
}

export function computeTagSubtitle(
  snippet: string | undefined,
  count: number,
): string {
  if (snippet) {
    return snippet;
  }

  if (count > 0) {
    return `${count} tagged block${count > 1 ? "s" : ""}`;
  }

  return "Filter pages by tag";
}

export function buildTagMetadata(
  tag: Tag,
  records: EnrichedTagRecord[],
  context: TagMetadataContext,
): TagMetadata {
  const { coords, firstRecord, pages } = context;

  return {
    ...tag.metadata,
    pageId: coords.pageId || tag.metadata?.pageId,
    blockId: coords.blockId ?? tag.metadata?.blockId,
    blockType: firstRecord?.blockType ?? tag.metadata?.blockType,
    snippet: firstRecord?.snippet ?? tag.metadata?.snippet,
    updatedAt: firstRecord?.updatedAt ?? tag.metadata?.updatedAt,
    pageTitle: coords.pageTitle,
    locations: records.map((record) => ({
      pageId: record.pageId,
      blockId: record.blockId,
      blockType: record.blockType,
      snippet: record.snippet,
      updatedAt: record.updatedAt,
      pageTitle: record.pageTitle ?? pages[record.pageId]?.title,
    })),
  };
}

function resolveTagCoordinates(
  tag: Tag,
  firstRecord: EnrichedTagRecord | undefined,
  pages: Record<string, SearchPageMeta | undefined>,
): { blockId?: string; pageId: string; pageTitle?: string } {
  const pageId =
    firstRecord?.pageId ?? tag.pageId ?? tag.metadata?.pageId ?? "";
  const blockId = firstRecord?.blockId ?? tag.blockId ?? tag.metadata?.blockId;
  const pageTitle =
    firstRecord?.pageTitle ?? (pageId ? pages[pageId]?.title : undefined);

  return { blockId, pageId, pageTitle };
}

export function buildTagSearchItem({
  pages,
  records,
  tag,
  workspaceId,
}: BuildTagItemOptions): SearchItem {
  const count = records.length;
  const firstRecord: EnrichedTagRecord | undefined =
    records.length > 0 ? records[0] : undefined;
  const coords = resolveTagCoordinates(tag, firstRecord, pages);

  const tagWithMeta: Tag = {
    ...tag,
    pageId: coords.pageId || tag.pageId,
    blockId: coords.blockId ?? tag.blockId,
    metadata: buildTagMetadata(tag, records, {
      coords,
      firstRecord,
      pages,
    }),
  };

  return {
    id: tag.id,
    pageId: coords.pageId,
    blockId: coords.blockId,
    blockType: firstRecord ? firstRecord.blockType : undefined,
    workspaceId,
    category: "tag" as const,
    title: `#${tag.name}`,
    subtitle: computeTagSubtitle(
      firstRecord ? firstRecord.snippet : undefined,
      count,
    ),
    tag: tagWithMeta,
  };
}

export async function scanDocumentsForTag({
  documentReader,
  pages,
  snippetExtractor = extractBlockSnippet,
  tagId,
}: ScanDocumentsForTagOptions): Promise<EnrichedTagRecord[]> {
  if (!documentReader) {
    return [];
  }

  const validPages = Object.values(pages).filter(
    (page): page is SearchPageMeta => Boolean(page),
  );

  const docResults = await Promise.all(
    validPages.map(async (pageMeta) => {
      try {
        const doc = await documentReader.getDocument(pageMeta.id);

        return { pageMeta, doc };
      } catch {
        return null;
      }
    }),
  );

  const records: EnrichedTagRecord[] = [];

  for (const result of docResults) {
    if (!result?.doc?.blocks) continue;

    const { pageMeta, doc } = result;

    for (const block of Object.values(doc.blocks)) {
      if (block.tags?.some((t) => t.id === tagId)) {
        const snippet = snippetExtractor(block, 150);

        records.push({
          tagId,
          pageId: doc.id,
          blockId: block.id,
          blockType: block.type,
          snippet,
          updatedAt: doc.updatedAt || Date.now(),
          pageTitle: pageMeta.title,
        });
      }
    }
  }

  return records;
}

export async function resolveTagRecords({
  documentReader,
  pages,
  snippetExtractor = extractBlockSnippet,
  tagId,
  tagIndexReader,
}: ResolveTagRecordsOptions): Promise<EnrichedTagRecord[]> {
  let records: EnrichedTagRecord[] = [];

  if (tagIndexReader?.getTagsIndex) {
    const rawRecords = await tagIndexReader.getTagsIndex(tagId);

    records = rawRecords.map((record) => ({
      ...record,
      pageTitle: pages[record.pageId]?.title,
    }));
  }

  if (records.length === 0 && documentReader) {
    records = await scanDocumentsForTag({
      documentReader,
      pages,
      snippetExtractor,
      tagId,
    });
  }

  return records;
}

/**
 * Pure composable function to search tags and their locations.
 */
export async function searchTags({
  documentReader,
  extractSnippet = extractBlockSnippet,
  pages,
  query,
  tagIndexReader,
  tags,
  workspaceId,
}: SearchTagsOptions): Promise<SearchItem[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const matchingTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(normalizedQuery),
  );

  if (matchingTags.length === 0) {
    return [];
  }

  return Promise.all(
    matchingTags.map(async (tag) => {
      const records = await resolveTagRecords({
        documentReader,
        pages,
        snippetExtractor: extractSnippet,
        tagId: tag.id,
        tagIndexReader,
      });

      return buildTagSearchItem({
        pages,
        records,
        tag,
        workspaceId,
      });
    }),
  );
}
