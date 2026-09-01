import type { DocumentBlock } from "@/types/document";

const DEFAULT_BLOCK_TITLE = "Untitled";
const DEFAULT_BLOCK_EDITOR = "You";

export function getBlockTitle(block: DocumentBlock): string {
  return block.properties.title?.[0]?.text ?? DEFAULT_BLOCK_TITLE;
}

export function getBlockIcon(block: DocumentBlock): string | undefined {
  return block.properties.icon;
}

export function getBlockPageId(block: DocumentBlock): string {
  return block.properties.pageId ?? block.properties.targetPageId ?? block.id;
}

export function getBlockSidePeekDocId(block: DocumentBlock): string {
  return block.properties.targetPageId ?? block.id;
}

export function getBlockLastEditedBy(block: DocumentBlock): string {
  return block.properties.lastEditedBy ?? DEFAULT_BLOCK_EDITOR;
}
