import type {
  BlockActions,
  BlockColorUpdate,
} from "@yaad/core/types/actions/block-actions";
import type { Tag } from "@yaad/core/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export type EditableBlockActions = Pick<
  BlockActions,
  | "addTag"
  | "applyColor"
  | "changeType"
  | "delete"
  | "duplicate"
  | "removeTag"
  | "updateTags"
>;

export function useBlockActions(
  blockId: string,
  explicitPageId?: string,
): EditableBlockActions {
  const contextPageId = useEditorPageIdContext();
  const pageId = explicitPageId || contextPageId;

  const duplicateBlock = useDocumentStore(
    (state) => state.duplicateBlock,
    pageId,
  );
  const changeBlockType = useDocumentStore(
    (state) => state.changeBlockType,
    pageId,
  );
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
    pageId,
  );
  const deleteBlock = useDocumentStore((store) => store.deleteBlock, pageId);
  const updateBlockTags = useDocumentStore(
    (state) => state.updateBlockTags,
    pageId,
  );
  const addTagToBlock = useDocumentStore(
    (state) => state.addTagToBlock,
    pageId,
  );
  const removeTagFromBlock = useDocumentStore(
    (state) => state.removeTagFromBlock,
    pageId,
  );

  return {
    changeType: (type) => {
      void changeBlockType(blockId, type);
    },

    applyColor: (color: BlockColorUpdate) => {
      void updateBlockProperties(blockId, pageId, { ...color });
    },

    duplicate: () => {
      void duplicateBlock(blockId);
    },

    delete: () => {
      void deleteBlock(blockId);
    },

    updateTags: (tags: Tag[]) => {
      void updateBlockTags(blockId, pageId, tags);
    },

    addTag: (tag: Tag) => {
      void addTagToBlock(blockId, pageId, tag);
    },

    removeTag: (tagId: string) => {
      void removeTagFromBlock(blockId, pageId, tagId);
    },
  };
}
