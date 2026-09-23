import type {
  SearchItem,
  SearchOptions,
  SearchProvider,
  SearchResponse,
} from "@yaad/core/types/search";

export class WebSearchProvider implements SearchProvider {
  async search(options: SearchOptions): Promise<SearchResponse> {
    console.log("[Web Search] Searching browser IndexedDB...", options.query);
    return { pages: [], tags: [] };
  }

  async getRecentPages(_limit: number): Promise<SearchItem[]> {
    return [];
  }
}
