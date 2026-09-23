import type { SearchItem } from "@yaad/core/types/search";

import { Tag as TagIcon } from "lucide-react";

import { CommandGroup } from "@/components/ui/command";

import { SearchItemRow } from "./search-item-row";

export interface MatchingTagsGroupProps {
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
}

export function MatchingTagsGroup({ items, onSelect }: MatchingTagsGroupProps) {
  if (items.length === 0) return null;

  return (
    <CommandGroup
      heading={
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TagIcon className="size-3.5" /> Matching Tags
        </span>
      }
    >
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <SearchItemRow key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </CommandGroup>
  );
}
