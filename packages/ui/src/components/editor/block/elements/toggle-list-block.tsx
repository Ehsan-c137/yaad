"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { ChevronRight } from "lucide-react";
import { useCallback } from "react";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";
import { cn } from "@/lib/utils";

import { BlockRow } from "../block-row";
import { EditableContent } from "../editable-content";

interface ToggleListBlockProps {
  block: DocumentBlock;
}

export function ToggleListBlock({ block }: ToggleListBlockProps) {
  const {
    pageId,
    text,
    isFocused,
    handleClearFocus,
    handleChange,
    handleBackspaceEmpty,
    handleTransformType,
    insertBlockBelow,
    addBlock,
    updateBlockProperties,
  } = useEditableBlock(block);

  const isOpen = Boolean(block.properties?.isOpen);
  const childrenIds: string[] = block.childrenIds ?? [];

  const handleToggle = useCallback(() => {
    void updateBlockProperties(block.id, pageId, {
      isOpen: !isOpen,
    });
  }, [block.id, isOpen, pageId, updateBlockProperties]);

  const handleEnter = useCallback(() => {
    if (childrenIds.length === 0 && isOpen) {
      void addBlock(block.id, block.id, "paragraph");
    } else {
      insertBlockBelow("toggle_list");
    }
  }, [childrenIds.length, isOpen, addBlock, block.id, insertBlockBelow]);

  return (
    <div className="w-full">
      <div className="group/toggle flex w-full items-start gap-1">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse toggle" : "Expand toggle"}
          onClick={handleToggle}
          className={cn(
            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-sm",
            "text-muted-foreground/60 transition-all duration-200 ease-out",
            "hover:bg-accent hover:text-foreground",
            "active:scale-90",
            "select-none outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-200 ease-out",
              isOpen && "rotate-90",
            )}
          />
        </button>

        <div
          className="min-w-0 flex-1"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleToggle();
          }}
        >
          <EditableContent
            html={text}
            placeholder="Toggle heading"
            className="text-base/relaxed text-foreground"
            autoFocus={isFocused}
            onFocusHandled={handleClearFocus}
            blockId={block.id}
            onChange={handleChange}
            onEnter={handleEnter}
            onBackspaceEmpty={handleBackspaceEmpty}
            onTransformType={handleTransformType}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="ml-5 border-l border-border/50 pl-1">
            {childrenIds.length > 0 ? (
              childrenIds.map((childId) => (
                <BlockRow key={childId} blockId={childId} />
              ))
            ) : (
              <div
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void addBlock(block.id, block.id, "paragraph");
                  }
                }}
                className={cn(
                  "flex min-h-8 cursor-pointer items-center rounded-md px-2",
                  "text-sm text-muted-foreground/50 italic",
                  "transition-colors duration-150 hover:bg-accent/30",
                )}
                onClick={() => void addBlock(block.id, block.id, "paragraph")}
              >
                Empty toggle. Click to add content.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
