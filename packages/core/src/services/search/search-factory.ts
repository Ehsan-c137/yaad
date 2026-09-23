import type { SearchProvider } from "@yaad/core/types/search";

import { IndexedDbSearchProvider } from "./indexeddb-search-provider";
import { TauriSearchProvider } from "./tauri-search-provider";
import { WebSearchProvider } from "./web-search-provider";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

function isWebEnvironment(): boolean {
  return typeof window !== "undefined";
}

export function createSearchProvider(): SearchProvider {
  if (isTauriEnvironment()) {
    return new TauriSearchProvider();
  }

  if (isWebEnvironment()) {
    return new IndexedDbSearchProvider();
  }

  return new WebSearchProvider();
}

export const searchProvider = createSearchProvider();
