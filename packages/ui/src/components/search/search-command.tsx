import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

import { useSearchCommand } from "./hooks/use-search-command";
import { MatchingPagesGroup } from "./search-group-pages";
import { RecentPagesGroup } from "./search-group-recent";
import { MatchingTagsGroup } from "./search-group-tags";
import { TagFilterBanner } from "./search-tag-filter-banner";
import { SearchTrigger } from "./search-trigger";

export function SearchBox() {
  const {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    selectedTagFilter,
    recentPages,
    tagResults,
    searchResults,
    hasActiveSearch,
    handleOpenChange,
    handleSelectItem,
    clearTagFilter,
  } = useSearchCommand();

  const pagesHeading = selectedTagFilter
    ? `Pages tagged with #${selectedTagFilter.name}`
    : "Matching Pages & Blocks";

  const hasNoSearchResults =
    hasActiveSearch && searchResults.length === 0 && tagResults.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <SearchTrigger onOpen={() => setOpen(true)} />

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages, #tags, or commands..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          {selectedTagFilter && (
            <TagFilterBanner
              tag={selectedTagFilter}
              onRemove={clearTagFilter}
            />
          )}

          <CommandList>
            {hasActiveSearch ? (
              <>
                {!selectedTagFilter && (
                  <MatchingTagsGroup
                    items={tagResults}
                    onSelect={handleSelectItem}
                  />
                )}

                <MatchingPagesGroup
                  items={searchResults}
                  headingTitle={pagesHeading}
                  onSelect={handleSelectItem}
                />

                {hasNoSearchResults && (
                  <CommandEmpty>
                    No results found for &quot;{searchQuery}&quot;
                  </CommandEmpty>
                )}
              </>
            ) : (
              <>
                <RecentPagesGroup
                  items={recentPages}
                  onSelect={handleSelectItem}
                />
                {recentPages.length === 0 && (
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
