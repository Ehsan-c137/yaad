import type {
  SearchItem,
  SearchOptions,
  SearchProvider,
  SearchResponse,
} from "@yaad/core/types/search";

import { storage as defaultStorage } from "@yaad/core/lib/storage/storage-provider";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTagStore } from "@yaad/core/store/use-tag-store";

import type {
  IndexedDbSearchProviderOptions,
  PageStateProvider,
  TagStateProvider,
} from "./search-types";

import { searchPages } from "./page-searcher";
import { getRecentPages } from "./recent-pages";
import { extractBlockSnippet } from "./snippet-extractor";
import { searchTags } from "./tag-searcher";

const defaultPageStateProvider: PageStateProvider = {
  getPages: () => useSidebarStore.getState().pages,
};

const defaultTagStateProvider: TagStateProvider = {
  getTags: () => useTagStore.getState().tags,
};

export function createIndexedDbSearchProvider(
  options: IndexedDbSearchProviderOptions = {},
): SearchProvider {
  const pageStateProvider =
    options.pageStateProvider ?? defaultPageStateProvider;
  const tagStateProvider = options.tagStateProvider ?? defaultTagStateProvider;
  const documentReader = options.documentReader ?? defaultStorage;
  const tagIndexReader = options.tagIndexReader ?? defaultStorage;
  const extractSnippet = options.extractSnippet ?? extractBlockSnippet;

  return {
    async search({
      query,
      tagId,
      workspaceId,
    }: SearchOptions): Promise<SearchResponse> {
      const activeQuery = query;
      const activeWorkspaceId = workspaceId;
      const pages = pageStateProvider.getPages();
      const tags = tagStateProvider.getTags();

      const [matchedTags, matchedPages] = await Promise.all([
        searchTags({
          documentReader,
          extractSnippet,
          pages,
          query: activeQuery,
          tagIndexReader,
          tags,
          workspaceId: activeWorkspaceId,
        }),
        searchPages({
          pages,
          query: activeQuery,
          tagId,
          tagIndexReader,
          workspaceId: activeWorkspaceId,
        }),
      ]);

      return {
        pages: matchedPages,
        tags: matchedTags,
      };
    },

    getRecentPages(
      limit: number,
      _signal?: AbortSignal,
    ): Promise<SearchItem[]> {
      const pages = pageStateProvider.getPages();

      return Promise.resolve(getRecentPages(pages, limit));
    },
  };
}

export class IndexedDbSearchProvider implements SearchProvider {
  private readonly provider: SearchProvider;

  constructor(options: IndexedDbSearchProviderOptions = {}) {
    this.provider = createIndexedDbSearchProvider(options);
  }

  search(options: SearchOptions): Promise<SearchResponse> {
    return this.provider.search(options);
  }

  getRecentPages(limit: number, signal?: AbortSignal): Promise<SearchItem[]> {
    return this.provider.getRecentPages(limit, signal);
  }
}

export const indexedDbSearchProvider = new IndexedDbSearchProvider();
