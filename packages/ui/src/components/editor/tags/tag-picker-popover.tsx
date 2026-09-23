"use client";

import type { Tag } from "@yaad/core/types/document";

import { Tag as TagIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { TagForm } from "./tag-form";

interface TagPickerPopoverProps {
  selectedTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  trigger?: React.ReactNode;
  align?: "center" | "end" | "start";
}

export function TagPickerPopover({
  selectedTags,
  onAddTag,
  onRemoveTag,
  trigger,
  align = "start",
}: TagPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <>
      <TagIcon className="size-3.5 text-muted-foreground" />
      <span>Tags</span>
    </>
  );

  const popoverTrigger = trigger ?? (
    <Button
      variant="ghost"
      size="xs"
      className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      {defaultTrigger}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={popoverTrigger as any} />
      <PopoverContent
        align={align}
        side="bottom"
        className="z-40 w-72 p-3 text-xs shadow-md"
      >
        <TagForm
          selectedTags={selectedTags}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      </PopoverContent>
    </Popover>
  );
}
