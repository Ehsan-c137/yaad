"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";

import { EditableContent } from "../editable-content";

interface QuoteBlockProps {
  block: DocumentBlock;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  const {
    text,
    isFocused,
    handleClearFocus,
    handleChange,
    changeBlockType,
    insertBlockBelow,
  } = useEditableBlock(block);

  const colorClass = block.properties?.color
    ? `text-${block.properties.color}-500`
    : "";

  // Pressing Enter creates a regular paragraph block below the quote
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return; // Allow multiline within the quote
    insertBlockBelow("paragraph");
  };

  // Pressing Backspace when the quote is empty turns it back to a paragraph
  const handleBackspaceEmpty = () => {
    if (!text || text.trim() === "") {
      void changeBlockType(block.id, "paragraph");
    }
  };

  return (
    <div className="my-1.5 w-full py-0.5">
      <div className="border-l-4 border-foreground py-1 pl-4">
        <EditableContent
          html={text}
          placeholder="Empty quote"
          className={`text-base/relaxed text-foreground italic ${colorClass}`}
          autoFocus={isFocused}
          onFocusHandled={handleClearFocus}
          blockId={block.id}
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspaceEmpty={handleBackspaceEmpty}
        />
      </div>
    </div>
  );
}
