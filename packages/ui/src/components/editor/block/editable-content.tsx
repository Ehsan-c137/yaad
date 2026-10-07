"use client";

import type { DocumentBlockType } from "@yaad/core/types/document";
import type { KeyboardEvent, RefObject } from "react";

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

interface SlashMenuPosition {
  top: number;
  left: number;
  anchorTop: number;
}

interface SlashMenuState {
  isOpen: boolean;
  query: string;
  position: SlashMenuPosition;
}

const INITIAL_SLASH_MENU_STATE: SlashMenuState = {
  isOpen: false,
  query: "",
  position: { top: 0, left: 0, anchorTop: 0 },
};

const RTL_CHARACTERS = /[\u0591-\u07ff\ufb1d-\ufdfd\ufe70-\ufefc]/;
const LTR_CHARACTERS = /[a-z]/i;
const SLASH_MENU_WIDTH = 288;
const SLASH_MENU_OFFSET_Y = 6;

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
  const [slashMenuState, setSlashMenuState] = useState<SlashMenuState>(
    INITIAL_SLASH_MENU_STATE,
  );

  useAutoFocus(contentRef, autoFocus, onFocusHandled);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== html) {
      contentRef.current.innerText = html;
      setCaretOffset(contentRef.current, caretOffsetRef.current);
    }
  }, [html]);

  const closeSlashMenu = () => {
    setSlashMenuState((prev) =>
      prev.isOpen ? INITIAL_SLASH_MENU_STATE : prev,
    );
  };

  const updateSlashMenu = (
    text: string,
    offset: number,
    direction: "ltr" | "rtl",
  ) => {
    const query = onTransformType ? detectSlashQuery(text, offset) : null;

    if (query === null) {
      closeSlashMenu();

      return;
    }

    if (!contentRef.current) return;

    const position = calculateSlashMenuPosition(contentRef.current, direction);

    if (position) {
      setSlashMenuState({ isOpen: true, query, position });
    }
  };

  const handleInput = () => {
    const element = contentRef.current;

    if (!element) return;

    const text = element.innerText;
    const direction = applyTextDirection(element, text);
    const offset = getCaretOffset(element);

    caretOffsetRef.current = offset;
    updateSlashMenu(text, offset, direction);
    onChange(text);
  };

  const handleSelectOption = (option: SlashOption) => {
    const element = contentRef.current;

    if (!element) return;

    const text = element.innerText;
    const lastSlashIndex = text.lastIndexOf("/");
    const cleanedText =
      lastSlashIndex !== -1 ? text.slice(0, lastSlashIndex) : text;

    onChange(cleanedText);
    closeSlashMenu();
    onTransformType?.(option.type);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (
      (slashMenuState.isOpen &&
        ["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) ||
      isMobile
    ) {
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
          onClose={closeSlashMenu}
        />
      )}
    </>
  );
}

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

function applyTextDirection(element: HTMLElement, text: string): "ltr" | "rtl" {
  const direction = getTextDirection(text);

  element.setAttribute("dir", direction);
  element.style.direction = direction;

  return direction;
}

function isValidRect(rect: DOMRect): boolean {
  return rect.top !== 0 || rect.bottom !== 0 || rect.left !== 0;
}

function getPrecedingCharRect(range: Range): DOMRect | null {
  if (range.startOffset <= 0) return null;

  try {
    const tempRange = range.cloneRange();

    tempRange.setStart(range.startContainer, range.startOffset - 1);

    const rect = tempRange.getBoundingClientRect();

    return isValidRect(rect) ? rect : null;
  } catch {
    return null;
  }
}

function getRangeRect(range: Range): DOMRect | null {
  const clientRects = range.getClientRects();

  if (clientRects.length > 0) {
    const firstRect = clientRects[0];

    if (isValidRect(firstRect)) {
      return firstRect;
    }
  }

  const bounding = range.getBoundingClientRect();

  if (isValidRect(bounding)) {
    return bounding;
  }

  return getPrecedingCharRect(range);
}

function calculateSlashMenuPosition(
  element: HTMLElement,
  direction: "ltr" | "rtl",
): SlashMenuPosition | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = getRangeRect(range) ?? element.getBoundingClientRect();
  const left = direction === "rtl" ? rect.right - SLASH_MENU_WIDTH : rect.left;

  return {
    top: rect.bottom + SLASH_MENU_OFFSET_Y,
    left,
    anchorTop: rect.top,
  };
}

function detectSlashQuery(text: string, offset: number): string | null {
  const lastSlashIndex = text.lastIndexOf("/");
  const isTriggerValid =
    lastSlashIndex !== -1 &&
    (lastSlashIndex === 0 || /\s/.test(text.charAt(lastSlashIndex - 1)));

  if (!isTriggerValid || offset <= lastSlashIndex) {
    return null;
  }

  const query = text.slice(lastSlashIndex + 1, offset);

  if (/\s/.test(query)) {
    return null;
  }

  return query;
}

function focusAndPositionCaretToEnd(element: HTMLElement) {
  element.focus();

  const selection = window.getSelection();

  if (!selection) return;

  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function useAutoFocus(
  ref: RefObject<HTMLDivElement | null>,
  autoFocus?: boolean,
  onFocusHandled?: () => void,
) {
  useEffect(() => {
    if (!autoFocus || !ref.current) return;

    const el = ref.current;

    focusAndPositionCaretToEnd(el);

    const rafId = requestAnimationFrame(() => {
      focusAndPositionCaretToEnd(el);
    });

    onFocusHandled?.();

    return () => cancelAnimationFrame(rafId);
  }, [autoFocus, onFocusHandled, ref]);
}
