import { useTranslation } from "react-i18next";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";

import { useSearchCommand } from "./hooks/use-search-command";
import { MatchingPagesGroup } from "./search-group-pages";
import { RecentPagesGroup } from "./search-group-recent";
import { MatchingTagsGroup } from "./search-group-tags";
import { TagFilterBanner } from "./search-tag-filter-banner";
import { SearchTrigger } from "./search-trigger";

export interface SearchCommandProps {
  className?: string;
  triggerClassName?: string;
}

export function SearchCommand({
  className,
  triggerClassName,
}: SearchCommandProps = {}) {
  const { t } = useTranslation("search");
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
    ? t("pagesTaggedWith", { tag: selectedTagFilter.name })
    : t("matchingPagesAndBlocks");

  const hasNoSearchResults =
    hasActiveSearch && searchResults.length === 0 && tagResults.length === 0;

  return (
    <div className={cn("inline-flex items-center", className)}>
      <SearchTrigger
        className={triggerClassName}
        onOpen={() => setOpen(true)}
      />

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchCommandPlaceholder")}
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
                    {t("noResultsFound", { query: searchQuery })}
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
                  <CommandEmpty>{t("noRecentPages")}</CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export const SearchBox = SearchCommand;
