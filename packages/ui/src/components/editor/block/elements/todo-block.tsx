"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";
import { cn } from "@/lib/utils";

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
  const [isBouncing, setIsBouncing] = useState(false);
  const [isJustChecked, setIsJustChecked] = useState(false);
  const prevCheckedRef = useRef(isChecked);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevCheckedRef.current !== isChecked) {
      prevCheckedRef.current = isChecked;
      setIsBouncing(true);

      if (isChecked) {
        setIsJustChecked(true);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsBouncing(false);
        setIsJustChecked(false);
      }, 300);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isChecked]);

  const handleToggleCheck = () => {
    void updateBlockProperties(block.id, pageId, {
      checked: !isChecked,
    });
  };

  return (
    <div className="flex w-full items-start gap-2.5 py-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-label={
          isChecked ? "Mark to-do as incomplete" : "Mark to-do as complete"
        }
        onClick={handleToggleCheck}
        className={cn(
          "group relative mt-1 flex size-4 shrink-0 items-center justify-center rounded-[5px] border outline-none select-none",
          "transition-all duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
          "after:absolute after:-inset-1.5",
          "active:scale-85",
          isChecked
            ? "border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/25"
            : "border-border/80 bg-input/30 hover:border-primary/60 hover:bg-primary/5",
          isBouncing && (isChecked ? "scale-110" : "scale-90"),
        )}
      >
        {isJustChecked && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-0.5 rounded-[5px] bg-primary/40 animate-ping opacity-75"
          />
        )}

        <Check
          strokeWidth={3}
          aria-hidden="true"
          className={cn(
            "size-3 text-primary-foreground transition-all duration-200 ease-out",
            isChecked
              ? "scale-100 opacity-100 rotate-0"
              : "scale-0 opacity-0 -rotate-45 pointer-events-none",
          )}
        />
      </button>

      <div
        className={cn(
          "min-w-0 flex-1 transition-all duration-300 ease-out",
          isChecked
            ? "text-muted-foreground/60 line-through decoration-muted-foreground/60 decoration-1"
            : "text-foreground decoration-transparent decoration-1",
        )}
      >
        <EditableContent
          html={text}
          placeholder="To-do"
          className={cn(
            "text-base transition-colors duration-300",
            isChecked ? "text-muted-foreground/60" : "text-foreground",
          )}
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
