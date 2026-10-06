import type { DocumentBlock, RichTextSegment } from "@yaad/core/types/document";

export function extractBlockSnippet(
  block: DocumentBlock,
  maxLength: number = 150,
): string {
  const properties = block.properties as Record<string, unknown> | undefined;

  if (!properties) {
    return "";
  }

  if (Array.isArray(properties.title)) {
    const text = (properties.title as (RichTextSegment | undefined)[])
      .map((segment) => (typeof segment?.text === "string" ? segment.text : ""))
      .join("");

    return text.slice(0, maxLength);
  }

  if (typeof properties.code === "string") {
    return properties.code.slice(0, maxLength);
  }

  if (typeof properties.caption === "string") {
    return properties.caption.slice(0, maxLength);
  }

  return "";
}
