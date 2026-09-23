import type { Tag } from "@yaad/core/types/document";

import { Edit2 } from "lucide-react";

import { TagBadge } from "./tag-badge";

interface selectedTagsProps {
  selectedTags: Tag[];
  search: string;
  onRemoveTag: (id: string) => void;
  onStartEditingTag: (tag: Tag) => void;
}

export function SelectedTags({
  selectedTags,
  search,
  onRemoveTag,
  onStartEditingTag,
}: selectedTagsProps) {
  return (
    <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto p-1">
      {selectedTags
        .filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
        .map((tag) => (
          <div key={tag.id} className="group flex items-center gap-1">
            <TagBadge tag={tag} onRemove={() => onRemoveTag(tag.id)} />
            <button
              type="button"
              onClick={() => onStartEditingTag(tag)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
              title="Edit tag"
            >
              <Edit2 className="size-3" />
            </button>
          </div>
        ))}
    </div>
  );
}
