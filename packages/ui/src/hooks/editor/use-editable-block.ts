"use client";

import type {
  DocumentBlock,
  DocumentBlockType,
} from "@yaad/core/types/document";

import { useCallback } from "react";

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

  const handleChange = useCallback(
    (newText: string) => {
      void updateBlockProperties(block.id, pageId, {
        title: [{ text: newText }],
      });
    },
    [block.id, pageId, updateBlockProperties],
  );

  const handleBackspaceEmpty = useCallback(() => {
    if (block.id !== "root") {
      void deleteBlock(block.id);
    }
  }, [block.id, deleteBlock]);

  const handleClearFocus = useCallback(() => {
    setFocusedBlockId(null);
  }, [setFocusedBlockId]);

  const handleTransformType = useCallback(
    (newType: DocumentBlockType) => {
      void changeBlockType(block.id, newType);
    },
    [block.id, changeBlockType],
  );

  const insertBlockBelow = useCallback(
    (type: DocumentBlockType = "paragraph") => {
      void addBlock(block.parentId ?? "root", block.id, type);
    },
    [block.parentId, block.id, addBlock],
  );

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
