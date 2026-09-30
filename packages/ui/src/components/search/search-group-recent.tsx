import type { SearchItem } from "@yaad/core/types/search";

import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CommandGroup } from "@/components/ui/command";

import { SearchItemRow } from "./search-item-row";

export interface RecentPagesGroupProps {
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
}

export function RecentPagesGroup({ items, onSelect }: RecentPagesGroupProps) {
  const { t } = useTranslation("search");

  if (items.length === 0) return null;

  return (
    <CommandGroup
      heading={
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {t("recentlyOpened")}
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
