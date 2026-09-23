"use client";

import type { Tag } from "@yaad/core/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import { TagList } from "../tags/tag-list";

interface BlockTagsProps {
  tags: Tag[];
  blockId: string;
}

export function BlockTags({ tags, blockId }: BlockTagsProps) {
  const pageId = useEditorPageIdContext();
  const addTagToBlock = useDocumentStore((state) => state.addTagToBlock);
  const removeTagFromBlock = useDocumentStore(
    (state) => state.removeTagFromBlock,
  );

  return (
    <>
      {tags && tags.length > 0 && (
        <div className="pt-1">
          <TagList
            tags={tags}
            size="sm"
            // showAddButton={true}
            onAddTag={(tag) => addTagToBlock(blockId, pageId, tag)}
            onRemoveTag={(tagId) => removeTagFromBlock(blockId, pageId, tagId)}
          />
        </div>
      )}
    </>
  );
}
