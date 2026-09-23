import type { Tag, TagColor } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AvailableColorList } from "./availabe-color-list";

interface TagGeneratorProps {
  tags: Tag[];
  onAddTag: (newTag: Tag) => void;
  search: string;
  onSearch: (newValue: string) => void;
}

export function TagGenerator({
  tags,
  onAddTag,
  search,
  onSearch,
}: TagGeneratorProps) {
  const [selectedColor, setSelectedColor] = useState<TagColor>("blue");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    }
  };

  const handleCreateTag = () => {
    const trimmed = search.trim();
    if (!trimmed) return;

    const existing = tags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      onSearch("");
      return;
    }

    const newTag: Tag = {
      id: `tag_${crypto.randomUUID()}`,
      name: trimmed,
      color: selectedColor,
    };

    onAddTag(newTag);
    onSearch("");
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search or create tag..."
        value={search}
        onChange={(e) => {
          e.stopPropagation();
          onSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="h-8 text-xs"
        autoFocus
      />

      {search.trim().length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <AvailableColorList
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <Button
            variant="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateTag();
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="mt-1 w-full gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Create tag &quot;{search.trim()}&quot;</span>
          </Button>
        </div>
      )}
    </div>
  );
}
