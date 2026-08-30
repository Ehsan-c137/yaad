"use client";

import { Clock, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import type { SearchItem } from "@/types/search";

import { SearchItemRow } from "@/components/search/search-item-row";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { ROUTES } from "@/constants/routes";
import { usePageSearch } from "@/hooks/search/use-page-search";
import { useRecentPages } from "@/hooks/search/use-recent-pages";
import { useDebounce } from "@/hooks/use-debounce";
import { useTabStore } from "@/store/use-tab-store";

export function SearchBox() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const router = useRouter();
  const openTab = useTabStore((s) => s.openTab);

  // Debounced search query (250ms delay)
  const debouncedQuery = useDebounce(searchQuery, 250);
  const isDebouncing = searchQuery.trim() !== debouncedQuery.trim();

  // Search providers following SRP
  const recentPages = useRecentPages(5);
  const searchResults = usePageSearch(debouncedQuery);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset query on close
  const handleOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setSearchQuery("");
    }
  }, []);

  // Select page item & navigate
  const handleSelectItem = React.useCallback(
    (item: SearchItem) => {
      setOpen(false);
      setSearchQuery("");
      openTab({
        pageId: item.pageId,
        workspaceId: item.workspaceId,
        title: item.title,
        icon: item.icon,
      });
      router.push(`/${ROUTES.workspace}/${item.workspaceId}/${item.pageId}`);
    },
    [openTab, router],
  );

  const hasSearchQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => setOpen(true)}
        size="icon-lg"
        title="Search (⌘K / Ctrl+K)"
        aria-label="Search"
      >
        <Search className="font-black" />
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages or type a command..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {hasSearchQuery ? (
              <>
                {searchResults.length === 0 && !isDebouncing ? (
                  <CommandEmpty>
                    No pages found for &quot;{debouncedQuery}&quot;
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading="Search Results">
                    {searchResults.map((item) => (
                      <SearchItemRow
                        key={item.id}
                        item={item}
                        onSelect={handleSelectItem}
                      />
                    ))}
                  </CommandGroup>
                )}
              </>
            ) : (
              <>
                {recentPages.length > 0 ? (
                  <CommandGroup
                    heading={
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> Recently Opened
                      </span>
                    }
                  >
                    {recentPages.map((item) => (
                      <SearchItemRow
                        key={item.id}
                        item={item}
                        onSelect={handleSelectItem}
                      />
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>No recent pages found.</CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
