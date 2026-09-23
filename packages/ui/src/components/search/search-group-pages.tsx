import type { SearchItem } from "@yaad/core/types/search";

import { CommandGroup } from "@/components/ui/command";

import { SearchItemRow } from "./search-item-row";

export interface MatchingPagesGroupProps {
  items: SearchItem[];
  headingTitle: string;
  onSelect: (item: SearchItem) => void;
}

export function MatchingPagesGroup({
  items,
  headingTitle,
  onSelect,
}: MatchingPagesGroupProps) {
  if (items.length === 0) return null;

  return (
    <CommandGroup heading={headingTitle}>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <SearchItemRow key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </CommandGroup>
  );
}
