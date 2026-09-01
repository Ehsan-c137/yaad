import type { DocumentBlockType } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

export function useBlockActions(blockId: string) {
  const pageId = useEditorPageIdContext();
  const duplicateBlock = useDocumentStore((state) => state.duplicateBlock);
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const deleteBlock = useDocumentStore((store) => store.deleteBlock);

  return {
    changeType: (type: DocumentBlockType) => changeBlockType(blockId, type),

    applyColor: ({ ...props }: Record<string, string>) =>
      updateBlockProperties(blockId, pageId, props),

    duplicate: () => duplicateBlock(blockId),

    delete: () => deleteBlock(blockId),
  };
}
