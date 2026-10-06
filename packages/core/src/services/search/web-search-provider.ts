import type {
  SearchItem,
  SearchOptions,
  SearchProvider,
  SearchResponse,
} from "@yaad/core/types/search";

export class WebSearchProvider implements SearchProvider {
  search(_options: SearchOptions): Promise<SearchResponse> {
    return Promise.resolve({
      pages: [],
      tags: [],
    });
  }

  getRecentPages(_limit: number): Promise<SearchItem[]> {
    return Promise.resolve([]);
  }
}
