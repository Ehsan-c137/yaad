import type { Tag } from "@yaad/core/types/document";
import type { SearchItem } from "@yaad/core/types/search";

import { ROUTES } from "@yaad/core/constants/routes";
import { searchProvider } from "@yaad/core/services/search/search-factory";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useRecentPages } from "@/hooks/search/use-recent-pages";
import { useTagSearch } from "@/hooks/search/use-tag-search";
import { useDebounce } from "@/hooks/use-debounce";

export interface UseSearchCommandReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTagFilter: Tag | null;
  setSelectedTagFilter: (tag: Tag | null) => void;
  recentPages: SearchItem[];
  tagResults: SearchItem[];
  searchResults: SearchItem[];
  isLoading: boolean;
  hasActiveSearch: boolean;
  isDebouncing: boolean;
  handleOpenChange: (isOpen: boolean) => void;
  handleSelectItem: (item: SearchItem) => void;
  clearTagFilter: () => void;
}

export function useSearchCommand(): UseSearchCommandReturn {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<Tag | null>(null);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const openTab = useTabStore((s) => s.openTab);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const debouncedQuery = useDebounce(searchQuery, 150);
  const isDebouncing = searchQuery !== debouncedQuery;

  const recentPages = useRecentPages(5);
  const tagResults = useTagSearch(debouncedQuery);

  const hasActiveSearch =
    debouncedQuery.trim().length > 0 || !!selectedTagFilter;

  useEffect(() => {
    if (!open || !hasActiveSearch) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    searchProvider
      .search({
        query: debouncedQuery,
        tagId: selectedTagFilter?.id ?? null,
        workspaceId: activeWorkspaceId ?? "",
        signal: controller.signal,
      })
      .then((res) => {
        setSearchResults(res.pages);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Search error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [
    open,
    debouncedQuery,
    selectedTagFilter?.id,
    activeWorkspaceId,
    hasActiveSearch,
  ]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setSearchQuery("");
      setSelectedTagFilter(null);
    }
  }, []);

  const clearTagFilter = useCallback(() => {
    setSelectedTagFilter(null);
  }, []);

  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      if (item.category === "tag" && item.tag) {
        const targetPageId =
          (item.pageId || item.tag.pageId) ?? item.tag.metadata?.pageId;

        const targetBlockId =
          item.blockId ?? item.tag.blockId ?? item.tag.metadata?.blockId;

        if (targetPageId) {
          setOpen(false);
          setSearchQuery("");
          setSelectedTagFilter(null);

          openTab({
            pageId: targetPageId,
            workspaceId: item.workspaceId,
            title: item.title,
            icon: item.icon,
          });

          const hash = targetBlockId ? `#${targetBlockId}` : "";

          void navigate(
            `/${ROUTES.workspace}/${item.workspaceId}/${targetPageId}${hash}`,
          );

          return;
        }

        setSelectedTagFilter(item.tag);
        setSearchQuery("");
        return;
      }

      setOpen(false);
      setSearchQuery("");
      setSelectedTagFilter(null);

      openTab({
        pageId: item.pageId,
        workspaceId: item.workspaceId,
        title: item.title,
        icon: item.icon,
      });

      const hash = item.blockId ? `#${item.blockId}` : "";

      void navigate(
        `/${ROUTES.workspace}/${item.workspaceId}/${item.pageId}${hash}`,
      );
    },

    [openTab, navigate],
  );

  return {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    selectedTagFilter,
    setSelectedTagFilter,
    recentPages,
    tagResults,
    searchResults,
    isLoading,
    hasActiveSearch,
    isDebouncing,
    handleOpenChange,
    handleSelectItem,
    clearTagFilter,
  };
}
