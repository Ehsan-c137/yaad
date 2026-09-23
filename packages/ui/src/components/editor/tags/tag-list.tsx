"use client";

import type { Tag } from "@yaad/core/types/document";

import { useTagStore } from "@yaad/core/store/use-tag-store";
import { Plus } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TagBadge } from "./tag-badge";
import { TagPickerPopover } from "./tag-picker-popover";

interface TagListProps {
  tags: Tag[];
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tagId: string) => void;
  readOnly?: boolean;
  className?: string;
  size?: "md" | "sm";
  showAddButton?: boolean;
}

export function TagList({
  tags,
  onAddTag,
  onRemoveTag,
  readOnly = false,
  className,
  size = "md",
  showAddButton = true,
}: TagListProps) {
  const addTags = useTagStore((state) => state.addTags);
  const hasTags = tags.length > 0;
  const canEdit = !readOnly && !!onAddTag && !!onRemoveTag && showAddButton;

  useEffect(() => {
    addTags(tags);
  }, [addTags, tags]);

  if (!hasTags && !canEdit) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 transition-opacity",
        className,
      )}
    >
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          size={size}
          onRemove={
            !readOnly && onRemoveTag ? () => onRemoveTag(tag.id) : undefined
          }
        />
      ))}

      {canEdit && (
        <TagPickerPopover
          selectedTags={tags}
          onAddTag={(tag) => {
            addTags([tag]);
            onAddTag?.(tag);
          }}
          onRemoveTag={(tagId) => onRemoveTag?.(tagId)}
          trigger={
            <Button
              variant="ghost"
              size="xs"
              className={cn(size === "md" && "h-6 text-xs")}
            >
              <Plus className="size-3" />
              <span>{hasTags ? "Add tag" : "Add tags"}</span>
            </Button>
          }
        />
      )}
    </div>
  );
}
