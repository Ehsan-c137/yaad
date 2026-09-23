"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";

import { EditableContent } from "../editable-content";

interface BulletListBlockProps {
  block: DocumentBlock;
}

export function BulletListBlock({ block }: BulletListBlockProps) {
  const {
    text,
    isFocused,
    handleClearFocus,
    handleChange,
    handleBackspaceEmpty,
    handleTransformType,
    insertBlockBelow,
  } = useEditableBlock(block);

  return (
    <div className="group flex w-full items-center gap-2">
      <div className="flex h-6 w-4 shrink-0 items-center justify-center select-none">
        <span className="size-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200" />
      </div>
      <EditableContent
        html={text}
        placeholder="Type '/' for commands..."
        className="list-disc pb-0 text-base/relaxed text-foreground"
        autoFocus={isFocused}
        onFocusHandled={handleClearFocus}
        blockId={block.id}
        onChange={handleChange}
        onEnter={() => insertBlockBelow("bulleted_list")}
        onBackspaceEmpty={handleBackspaceEmpty}
        onTransformType={handleTransformType}
      />
    </div>
  );
}
