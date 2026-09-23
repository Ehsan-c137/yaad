import type { Tag } from "@yaad/core/types/document";

import { Tag as TagIcon } from "lucide-react";

import { TagBadge } from "@/components/editor/tags/tag-badge";

export interface TagFilterBannerProps {
  tag: Tag;
  onRemove: () => void;
}

export function TagFilterBanner({ tag, onRemove }: TagFilterBannerProps) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 font-medium">
        <TagIcon className="size-3" /> Tag Filter:
      </span>
      <TagBadge tag={tag} size="sm" onRemove={onRemove} />
    </div>
  );
}
