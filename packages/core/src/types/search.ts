import type { DocumentBlockType, Tag } from "./document";

export type SearchItemCategory = "action" | "block" | "page" | "recent" | "tag";

export interface SearchItem {
  category: SearchItemCategory;
  icon?: string;
  id: string;
  lastAccessedAt?: number;
  pageId: string;
  blockId?: string;
  blockType?: DocumentBlockType;
  subtitle?: string;
  title: string;
  workspaceId: string;
  tag?: Tag;
}

export interface SearchOptions {
  query: string;
  tagId: string | null;
  workspaceId: string;
  limit?: number;
  signal?: AbortSignal;
}

export interface SearchResponse {
  pages: SearchItem[];
  tags: SearchItem[];
}

export interface SearchProvider {
  search: (options: SearchOptions) => Promise<SearchResponse>;
  getRecentPages: (
    limit: number,
    signal?: AbortSignal,
  ) => Promise<SearchItem[]>;
}
