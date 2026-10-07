"use client";

import type { Tag } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TagPickerPopover } from "@/components/editor/tags/tag-picker-popover";

const EMPTY_TAGS: Tag[] = [];

interface MobileTagsSectionProps {
  tags?: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
}

export function MobileTagsSection({
  tags = EMPTY_TAGS,
  onAddTag,
  onRemoveTag,
}: MobileTagsSectionProps) {
  const { t } = useTranslation("editor");

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <TagIcon className="size-3.5" />
        <span>{t("tags")}</span>
      </div>
      <TagPickerPopover
        selectedTags={tags}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-9 text-xs"
          >
            <div className="flex items-center gap-2">
              <TagIcon className="size-3.5 text-muted-foreground" />
              <span>{t("manageTags")}</span>
            </div>
            {tags.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {tags.length} {t("tags")}
              </span>
            )}
          </Button>
        }
      />
    </div>
  );
}
