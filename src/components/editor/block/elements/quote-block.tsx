"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface QuoteBlockProps {
  block: DocumentBlock;
  isFocused?: boolean;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  //   const insertBlockAfter = useDocumentStore((state) => state.addBlock);
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);

  const textContent = block.properties?.title?.[0]?.text || "";
  const colorClass = block.properties?.color
    ? `text-${block.properties.color}-500`
    : "";

  const handleChange = (newHtml: string) => {
    void updateBlockProperties(block.id, pageId, {
      title: [{ text: newHtml }],
    });
  };

  // Pressing Enter creates a regular paragraph block below the quote
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return; // Allow multiline within the quote
    e.preventDefault();
    // insertBlockAfter(block.id, "paragraph");
  };

  // Pressing Backspace when the quote is empty turns it back to a paragraph
  const handleBackspaceEmpty = () => {
    if (!textContent || textContent.trim() === "") {
      void changeBlockType(block.id, "paragraph");
    }
  };

  return (
    <div className="my-1.5 w-full py-0.5">
      <div className="border-l-4 border-foreground py-1 pl-4">
        <EditableContent
          html={textContent}
          placeholder="Empty quote"
          className={`text-base/relaxed text-foreground italic ${colorClass}`}
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
        />
      </div>
    </div>
  );
}
