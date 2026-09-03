"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface BulletListBlockProps {
  block: DocumentBlock;
}

export function BulletListBlock({ block }: BulletListBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();

  const changeBlockType = useDocumentStore((state) => state.changeBlockType);
  const addBlock = useDocumentStore((state) => state.addBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);

  const text = block.properties?.title?.[0]?.text ?? "";

  const handleChange = async (newText: string) => {
    await updateBlockProperties(block.id, pageId, {
      title: [{ text: newText }],
    });
  };

  const handleEnter = async () => {
    // Create new paragraph block directly below the current block
    await addBlock(block.parentId ?? "root", block.id, "bulleted_list");
  };

  const handleBackspaceEmpty = async () => {
    if (block.id !== "root") {
      await deleteBlock(block.id);
    }
  };

  return (
    <div className="group flex w-full items-center gap-2">
      <div className="flex h-6 w-4 shrink-0 items-center justify-center select-none">
        <span className="size-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200" />
      </div>
      <EditableContent
        html={text}
        placeholder="Type '/' for commands..."
        className="list-disc pb-0 text-base/relaxed text-foreground"
        onChange={handleChange}
        onEnter={handleEnter}
        onBackspaceEmpty={handleBackspaceEmpty}
        onTransformType={(newType) => changeBlockType(block.id, newType)}
      />
    </div>
  );
}
