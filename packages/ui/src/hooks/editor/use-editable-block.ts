"use client";

import type {
  DocumentBlock,
  DocumentBlockType,
} from "@yaad/core/types/document";

import { useCallback } from "react";

import { useEditorPermissions } from "@/context/editor-permissions-context";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function useEditableBlock(
  block: DocumentBlock,
  options?: { readOnly?: boolean },
) {
  const pageId = useEditorPageIdContext();
  const permissions = useEditorPermissions();
  const isReadOnly = options?.readOnly ?? permissions.isReadOnly;

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
      if (isReadOnly) return;
      void updateBlockProperties(block.id, pageId, {
        title: [{ text: newText }],
      });
    },
    [isReadOnly, block.id, pageId, updateBlockProperties],
  );

  const handleBackspaceEmpty = useCallback(() => {
    if (isReadOnly) return;
    if (block.id !== "root") {
      void deleteBlock(block.id);
    }
  }, [isReadOnly, block.id, deleteBlock]);

  const handleClearFocus = useCallback(() => {
    setFocusedBlockId(null);
  }, [setFocusedBlockId]);

  const handleTransformType = useCallback(
    (newType: DocumentBlockType) => {
      if (isReadOnly) return;
      void changeBlockType(block.id, newType);
    },
    [isReadOnly, block.id, changeBlockType],
  );

  const insertBlockBelow = useCallback(
    (type: DocumentBlockType = "paragraph") => {
      if (isReadOnly) return;
      void addBlock(block.parentId ?? "root", block.id, type);
    },
    [isReadOnly, block.parentId, block.id, addBlock],
  );

  return {
    pageId,
    text,
    isFocused,
    isReadOnly,
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
