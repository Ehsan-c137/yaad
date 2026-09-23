import type { Tag } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Tag as TagIcon } from "lucide-react";

import { TagPickerPopover } from "@/components/editor/tags/tag-picker-popover";

interface BlockTagMenuProps {
  blockTags: Tag[];
  onAddTag: (newTag: Tag) => void;
  onRemoveTag: (id: string) => void;
}

export function BlockTagMenu({
  blockTags,
  onAddTag,
  onRemoveTag,
}: BlockTagMenuProps) {
  return (
    <TagPickerPopover
      selectedTags={blockTags ?? []}
      onAddTag={onAddTag}
      onRemoveTag={onRemoveTag}
      trigger={
        <Button
          variant="ghost"
          className="flex items-center gap-2 w-full px-2 justify-start"
        >
          <TagIcon className="size-3 text-muted-foreground" />
          <span className="font-normal">Tags</span>
          {(blockTags?.length ?? 0) > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {blockTags?.length}
            </span>
          )}
        </Button>
      }
    />
  );
}
