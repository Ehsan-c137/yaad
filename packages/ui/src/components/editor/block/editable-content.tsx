"use client";

import type { DocumentBlockType } from "@yaad/core/types/document";
import type { KeyboardEvent } from "react";

import {
  getCaretOffset,
  setCaretOffset,
} from "@yaad/core/lib/editor/selection";
import { useEffect, useRef, useState } from "react";

import type { SlashOption } from "../slash-menu/slash-options";

import { SlashMenu } from "../slash-menu/slash-menu";

interface EditableContentProps {
  html: string;
  placeholder?: string;
  className?: string;
  blockType?: DocumentBlockType;
  autoFocus?: boolean;
  onFocusHandled?: () => void;
  blockId?: string;
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
  autoFocus,
  onFocusHandled,
  blockId,
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
    position: { top: number; left: number; anchorTop: number };
  }>({
    isOpen: false,
    query: "",
    position: { top: 0, left: 0, anchorTop: 0 },
  });

  // Handle auto-focus for newly created blocks
  useEffect(() => {
    if (autoFocus && contentRef.current) {
      const el = contentRef.current;

      const focusAndPositionCaret = () => {
        el.focus();
        const selection = window.getSelection();

        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };

      focusAndPositionCaret();
      const rafId = requestAnimationFrame(focusAndPositionCaret);
      onFocusHandled?.();

      return () => cancelAnimationFrame(rafId);
    }
  }, [autoFocus, onFocusHandled]);

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

    // The slash trigger should either be at the start of text/line or preceded by whitespace
    const isTriggerValid =
      lastSlashIndex !== -1 &&
      (lastSlashIndex === 0 || /\s/.test(text[lastSlashIndex - 1] ?? ""));

    if (onTransformType && isTriggerValid && offset > lastSlashIndex) {
      const query = text.slice(lastSlashIndex + 1, offset);

      if (!/[\s\n]/.test(query)) {
        // Get cursor coordinates for fixed positioning
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let rect: DOMRect | null = null;

          // 1. Try range.getClientRects()
          const clientRects = range.getClientRects();

          if (clientRects.length > 0) {
            const r = clientRects[0];
            if (r.top !== 0 || r.bottom !== 0 || r.left !== 0) {
              rect = r;
            }
          }

          // 2. Try range.getBoundingClientRect()
          if (!rect) {
            const bounding = range.getBoundingClientRect();
            if (
              bounding.top !== 0 ||
              bounding.bottom !== 0 ||
              bounding.left !== 0
            ) {
              rect = bounding;
            }
          }

          // 3. If range is collapsed, select the character preceding the caret (the slash or query char)
          if (!rect && range.startContainer) {
            try {
              const tempRange = range.cloneRange();

              if (range.startOffset > 0) {
                tempRange.setStart(range.startContainer, range.startOffset - 1);
                const tempRect = tempRange.getBoundingClientRect();
                if (
                  tempRect.top !== 0 ||
                  tempRect.bottom !== 0 ||
                  tempRect.left !== 0
                ) {
                  rect = tempRect;
                }
              }
            } catch {
              // Ignore range adjustment error
            }
          }

          // 4. Fallback to the contentEditable element rect
          if (!rect && contentRef.current) {
            rect = contentRef.current.getBoundingClientRect();
          }

          if (rect) {
            // For RTL, align right edge of 288px menu with rect.right; for LTR, align left edge with rect.left
            const leftPos = direction === "rtl" ? rect.right - 288 : rect.left;

            setSlashMenuState({
              isOpen: true,
              query,
              position: {
                top: rect.bottom + 6,
                left: leftPos,
                anchorTop: rect.top,
              },
            });
          }
        }
      } else if (slashMenuState.isOpen) {
        setSlashMenuState((prev) => ({ ...prev, isOpen: false }));
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
      position: { top: 0, left: 0, anchorTop: 0 },
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
      const text = contentRef.current?.innerText ?? "";

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
        data-block-id={blockId}
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
