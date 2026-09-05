"use client";

import type { KeyboardEvent } from "react";

import { useEffect, useRef, useState } from "react";

import type { DocumentBlockType } from "@/types/document";

import { getCaretOffset, setCaretOffset } from "@/lib/editor/selection";

import type { SlashOption } from "../slash-menu/slash-options";

import { SlashMenu } from "../slash-menu/slash-menu";

interface EditableContentProps {
  html: string;
  placeholder?: string;
  className?: string;
  blockType?: DocumentBlockType;
  onChange: (text: string) => void;
  onEnter?: (e: KeyboardEvent) => void;
  onBackspaceEmpty?: () => void;
  onTransformType?: (type: DocumentBlockType) => void;
}

const RTL_CHARACTERS = /[\u0591-\u07ff\ufb1d-\ufdfd\ufe70-\ufefc]/;
const LTR_CHARACTERS = /[a-z]/i;

function getTextDirection(text: string): "ltr" | "rtl" {
  const trimmed = text.trim();

  if (!trimmed) return "ltr";

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let firstStrongCharacter: string | undefined;

  for (const { segment } of segmenter.segment(trimmed)) {
    if (RTL_CHARACTERS.test(segment) || LTR_CHARACTERS.test(segment)) {
      firstStrongCharacter = segment;
      break;
    }
  }

  if (!firstStrongCharacter) return "ltr";

  return RTL_CHARACTERS.test(firstStrongCharacter) ? "rtl" : "ltr";
}

export function EditableContent({
  html,
  placeholder,
  className = "",
  onChange,
  onEnter,
  onBackspaceEmpty,
  onTransformType,
}: EditableContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const caretOffsetRef = useRef<number>(0);

  const [slashMenuState, setSlashMenuState] = useState<{
    isOpen: boolean;
    query: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: "",
    position: { top: 0, left: 0 },
  });

  // Synchronize HTML with DOM while maintaining caret position
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== html) {
      contentRef.current.innerText = html;
      setCaretOffset(contentRef.current, caretOffsetRef.current);
    }
  }, [html]);

  const handleInput = () => {
    if (!contentRef.current) return;
    const text = contentRef.current.innerText || "";
    const offset = getCaretOffset(contentRef.current);
    const direction = getTextDirection(text);

    contentRef.current.setAttribute("dir", direction);
    contentRef.current.style.direction = direction;
    caretOffsetRef.current = offset;

    // Detect '/' trigger and query string
    const lastSlashIndex = text.lastIndexOf("/");

    if (lastSlashIndex !== -1 && offset > lastSlashIndex) {
      const query = text.slice(lastSlashIndex + 1, offset);

      // Get cursor coordinates for fixed positioning
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        const rect = range.getBoundingClientRect();

        setSlashMenuState({
          isOpen: true,
          query,
          position: {
            top: rect.bottom + 6,
            left: direction === "rtl" ? rect.right + 10 : rect.left + 10,
          },
        });
      }
    } else if (slashMenuState.isOpen) {
      setSlashMenuState((prev) => ({ ...prev, isOpen: false }));
    }

    onChange(text);
  };

  const handleSelectOption = (option: SlashOption) => {
    if (!contentRef.current) return;

    // Clear out slash command text from block content
    const text = contentRef.current.innerText || "";
    const lastSlashIndex = text.lastIndexOf("/");
    const cleanedText =
      lastSlashIndex !== -1 ? text.slice(0, lastSlashIndex) : text;

    onChange(cleanedText);
    setSlashMenuState({
      isOpen: false,
      query: "",
      position: { top: 0, left: 0 },
    });

    if (onTransformType) {
      onTransformType(option.type);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (
      (slashMenuState.isOpen &&
        ["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) ||
      isMobile
    ) {
      // Prevent block Enter / Split behavior when slash menu is intercepting keys
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.(e);
    }
    if (e.key === "Backspace") {
      const text = contentRef.current?.innerText || "";

      if (text.trim().length === 0) {
        e.preventDefault();
        onBackspaceEmpty?.();
      }
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        style={{ direction: "ltr" }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`w-full text-start wrap-break-word whitespace-pre-wrap outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] ${className}`}
      />
      {slashMenuState.isOpen && (
        <SlashMenu
          position={slashMenuState.position}
          query={slashMenuState.query}
          onSelect={handleSelectOption}
          onClose={() =>
            setSlashMenuState((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}
    </>
  );
}
