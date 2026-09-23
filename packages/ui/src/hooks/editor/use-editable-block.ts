"use client";

import type {
  DocumentBlock,
  DocumentBlockType,
} from "@yaad/core/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function useEditableBlock(block: DocumentBlock) {
  const pageId = useEditorPageIdContext();
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);
  const addBlock = useDocumentStore((state) => state.addBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const isFocused = useDocumentStore(
    (state) => state.focusedBlockId === block.id,
  );
  const setFocusedBlockId = useDocumentStore(
    (state) => state.setFocusedBlockId,
  );

  const text = block.properties?.title?.[0]?.text ?? "";

  const handleChange = (newText: string) => {
    void updateBlockProperties(block.id, pageId, {
      title: [{ text: newText }],
    });
  };

  const handleBackspaceEmpty = () => {
    if (block.id !== "root") {
      void deleteBlock(block.id);
    }
  };

  const handleClearFocus = () => {
    setFocusedBlockId(null);
  };

  const handleTransformType = (newType: DocumentBlockType) => {
    void changeBlockType(block.id, newType);
  };

  const insertBlockBelow = (type: DocumentBlockType = "paragraph") => {
    void addBlock(block.parentId ?? "root", block.id, type);
  };

  return {
    pageId,
    text,
    isFocused,
    setFocusedBlockId,
    handleClearFocus,
    handleChange,
    handleBackspaceEmpty,
    handleTransformType,
    insertBlockBelow,
    updateBlockProperties,
    changeBlockType,
    addBlock,
    deleteBlock,
  };
}
