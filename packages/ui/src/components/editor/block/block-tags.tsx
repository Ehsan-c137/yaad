/* eslint-disable @typescript-eslint/no-unnecessary-condition */
"use client";

import type { Tag } from "@yaad/core/types/document";

import { useEditorPermissions } from "@/context/editor-permissions-context";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import { TagList } from "../tags/tag-list";

interface BlockTagsProps {
  tags: Tag[];
  blockId: string;
}

export function BlockTags({ tags, blockId }: BlockTagsProps) {
  const pageId = useEditorPageIdContext();
  const { isReadOnly } = useEditorPermissions();
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
            readOnly={isReadOnly}
            onAddTag={(tag) => {
              if (isReadOnly) return;
              void addTagToBlock(blockId, pageId, tag);
            }}
            onRemoveTag={(tagId) => {
              if (isReadOnly) return;
              void removeTagFromBlock(blockId, pageId, tagId);
            }}
          />
        </div>
      )}
    </>
  );
}
