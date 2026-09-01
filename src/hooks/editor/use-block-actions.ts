import type {
  BlockActions,
  BlockColorUpdate,
} from "@/types/actions/block-actions";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

export type EditableBlockActions = Pick<
  BlockActions,
  "applyColor" | "changeType" | "delete" | "duplicate"
>;

export function useBlockActions(blockId: string): EditableBlockActions {
  const pageId = useEditorPageIdContext();
  const duplicateBlock = useDocumentStore((state) => state.duplicateBlock);
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const deleteBlock = useDocumentStore((store) => store.deleteBlock);

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
  };
}
