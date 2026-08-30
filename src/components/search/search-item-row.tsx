import type { SearchItem } from "@/types/search";

import { CommandItem } from "@/components/ui/command";

interface SearchItemRowProps {
  item: SearchItem;
  onSelect: (item: SearchItem) => void;
}

export function SearchItemRow({ item, onSelect }: SearchItemRowProps) {
  return (
    <CommandItem
      value={`${item.title} ${item.subtitle ?? ""} ${item.pageId}`}
      onSelect={() => onSelect(item)}
      className="flex cursor-pointer items-center gap-2.5 px-3 py-2"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-base select-none">
        {item.icon ?? "📄"}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {item.title}
        </span>
        {item.subtitle ? (
          <span className="truncate text-xs text-muted-foreground">
            {item.subtitle}
          </span>
        ) : null}
      </div>
    </CommandItem>
  );
}
