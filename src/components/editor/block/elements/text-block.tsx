"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface TextBlockProps {
  block: DocumentBlock;
}

export function TextBlock({ block }: TextBlockProps) {
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
    await addBlock(block.parentId ?? "root", block.id, "paragraph");
  };

  const handleBackspaceEmpty = async () => {
    if (block.id !== "root") {
      await deleteBlock(block.id);
    }
  };

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- the default branch intentionally renders every non-heading block type as a paragraph
  switch (block.type) {
    case "heading_1":
      return (
        <EditableContent
          html={text}
          placeholder="Heading 1"
          className="mt-6 mb-2 text-3xl font-bold text-foreground"
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
          onTransformType={(newType) => changeBlockType(block.id, newType)}
        />
      );

    case "heading_2":
      return (
        <EditableContent
          html={text}
          placeholder="Heading 2"
          className="mt-4 mb-1 text-2xl font-semibold text-foreground"
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
          onTransformType={(newType) => changeBlockType(block.id, newType)}
        />
      );

    case "heading_3":
      return (
        <EditableContent
          html={text}
          placeholder="Heading 3"
          className="mt-3 mb-1 text-xl font-medium text-foreground"
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
          onTransformType={(newType) => changeBlockType(block.id, newType)}
        />
      );

    case "paragraph":

    default:
      return (
        <EditableContent
          html={text}
          placeholder="Type '/' for commands..."
          className="py-1 text-base/relaxed text-foreground"
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
          onTransformType={(newType) => changeBlockType(block.id, newType)}
        />
      );
  }
}
