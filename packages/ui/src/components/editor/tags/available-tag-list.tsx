import type { Tag } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Edit2 } from "lucide-react";

import { TagBadge } from "./tag-badge";

interface AvailableTagList {
  tags: Tag[];
  onAddTag: (v: Tag) => void;
  onStartEditingTag: (v: Tag) => void;
}

export function AvailableTagList({
  tags,
  onAddTag,
  onStartEditingTag,
}: AvailableTagList) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <div className="text-[11px] font-medium text-muted-foreground">
        Available tags
      </div>
      <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto p-1">
        {tags.map((tag) => (
          <div key={tag.id} className="group flex items-center gap-1">
            <Button
              variant="outline"
              onClick={() => onAddTag(tag)}
              className="rounded-full"
            >
              <TagBadge tag={tag} />
            </Button>
            <Button
              variant="outline"
              onClick={() => onStartEditingTag(tag)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
              title="Edit tag"
            >
              <Edit2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
