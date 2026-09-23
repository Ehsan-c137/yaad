"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";

import { EditableContent } from "../editable-content";

interface TodoBlockProps {
  block: DocumentBlock;
}

export function TodoBlock({ block }: TodoBlockProps) {
  const {
    pageId,
    text,
    isFocused,
    handleClearFocus,
    handleChange,
    handleBackspaceEmpty,
    handleTransformType,
    insertBlockBelow,
    updateBlockProperties,
  } = useEditableBlock(block);

  const isChecked = Boolean(block.properties?.checked);

  const handleToggleCheck = () => {
    void updateBlockProperties(block.id, pageId, {
      checked: !isChecked,
    });
  };

  return (
    <div className="flex w-full items-start gap-2 py-1">
      {/* Custom Checkbox */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleCheck}
        className="mt-1 size-4 cursor-pointer rounded-sm border-border text-primary accent-primary focus:ring-0"
      />

      {/* Checkable Text Content */}
      <div
        className={`min-w-0 flex-1 ${isChecked ? "text-muted-foreground line-through" : ""}`}
      >
        <EditableContent
          html={text}
          placeholder="To-do"
          className="text-base text-foreground"
          autoFocus={isFocused}
          onFocusHandled={handleClearFocus}
          blockId={block.id}
          onChange={handleChange}
          onEnter={() => insertBlockBelow("todo")}
          onBackspaceEmpty={handleBackspaceEmpty}
          onTransformType={handleTransformType}
          blockType={block.type}
        />
      </div>
    </div>
  );
}
