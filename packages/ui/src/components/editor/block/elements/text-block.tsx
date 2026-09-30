"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { useTranslation } from "react-i18next";

import { useEditableBlock } from "@/hooks/editor/use-editable-block";

import { EditableContent } from "../editable-content";

interface TextBlockProps {
  block: DocumentBlock;
}

export function TextBlock({ block }: TextBlockProps) {
  const { t } = useTranslation("editor");
  const {
    text,
    isFocused,
    handleClearFocus,
    handleChange,
    handleBackspaceEmpty,
    handleTransformType,
    insertBlockBelow,
  } = useEditableBlock(block);

  const handleEnter = () => insertBlockBelow("paragraph");

  const commonProps = {
    html: text,
    autoFocus: isFocused,
    onFocusHandled: handleClearFocus,
    blockId: block.id,
    onChange: handleChange,
    onEnter: handleEnter,
    onBackspaceEmpty: handleBackspaceEmpty,
    onTransformType: handleTransformType,
  };

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- the default branch intentionally renders every non-heading block type as a paragraph
  switch (block.type) {
    case "heading_1":
      return (
        <EditableContent
          {...commonProps}
          placeholder={t("slashH1")}
          className="mt-6 mb-2 text-3xl font-bold text-foreground"
        />
      );

    case "heading_2":
      return (
        <EditableContent
          {...commonProps}
          placeholder={t("slashH2")}
          className="mt-4 mb-1 text-2xl font-semibold text-foreground"
        />
      );

    case "heading_3":
      return (
        <EditableContent
          {...commonProps}
          placeholder={t("slashH3")}
          className="mt-3 mb-1 text-xl font-medium text-foreground"
        />
      );

    case "paragraph":

    default:
      return (
        <EditableContent
          {...commonProps}
          placeholder={t("typeForCommands")}
          className="py-1 text-base/relaxed text-foreground"
        />
      );
  }
}
