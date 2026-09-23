import type { Tag, TagColor } from "@yaad/core/types/document";

import { useTagStore } from "@yaad/core/store/use-tag-store";
import { useState } from "react";

import { AvailableTagList } from "./available-tag-list";
import { EditTag } from "./edit-tag";
import { SelectedTags } from "./selected-tags";
import { TagGenerator } from "./tag-generator";

interface TagFormProps {
  selectedTags: Tag[];
  onAddTag: (newTag: Tag) => void;
  onRemoveTag: (id: string) => void;
}

export function TagForm({ selectedTags, onAddTag, onRemoveTag }: TagFormProps) {
  const allTags = useTagStore((s) => s.tags);
  const addTagToStore = useTagStore((s) => s.addTag);
  const updateTagInStore = useTagStore((s) => s.updateTag);
  const deleteTagFromStore = useTagStore((s) => s.deleteTag);

  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<{
    color: TagColor;
    name: string;
  }>({ name: "", color: "blue" });
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const startEditingTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditData({ color: tag.color, name: tag.name });
  };

  const handleAddTag = (tag: Tag) => {
    addTagToStore(tag);
    onAddTag(tag);
  };

  const handleUpdateTag = (
    tagId: string,
    updates: { name: string; color: TagColor },
  ) => {
    updateTagInStore(tagId, updates);
    setEditingTagId(null);
  };

  const handleDeleteTag = (id: string) => {
    deleteTagFromStore(id);
    onRemoveTag(id);

    if (editingTagId === id) {
      setEditingTagId(null);
    }
  };

  const selectedTagIds = new Set(selectedTags.map((tag) => tag.id));
  const availableTags = allTags.filter((tag) => !selectedTagIds.has(tag.id));

  return (
    <div
      className="flex flex-col gap-2.5"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="font-semibold text-foreground">Manage Tags</div>

      <TagGenerator
        tags={allTags}
        onAddTag={handleAddTag}
        onSearch={setSearch}
        search={search}
      />

      {editingTagId && (
        <EditTag
          tagId={editingTagId}
          editData={editData}
          onEditData={setEditData}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
          onClearEditingId={() => setEditingTagId(null)}
        />
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="text-[11px] font-medium text-muted-foreground">
          Applied tags ({selectedTags.length})
        </div>
        {selectedTags.length === 0 ? (
          <div className="py-2 text-center text-[11px] text-muted-foreground/70">
            No tags added yet.
          </div>
        ) : (
          <SelectedTags
            selectedTags={selectedTags}
            search={search}
            onRemoveTag={onRemoveTag}
            onStartEditingTag={startEditingTag}
          />
        )}
        {availableTags.length > 0 && (
          <AvailableTagList
            tags={availableTags}
            onAddTag={handleAddTag}
            onStartEditingTag={startEditingTag}
          />
        )}
      </div>
    </div>
  );
}
