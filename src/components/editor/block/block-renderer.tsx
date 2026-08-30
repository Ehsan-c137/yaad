"use client";

import type { DocumentBlock } from "@/types/document";

import { CalloutBlock } from "./elements/callout-block";
import { CodeBlock } from "./elements/code-block";
// import { FileBlock } from "./file-block";
import { ImageBlock } from "./elements/image-block";
import { LinkPreviewBlock } from "./elements/link-preview-block";
import { PageBlock } from "./elements/page-block";
import { QuoteBlock } from "./elements/quote-block";
import { TableBlock } from "./elements/table-block";
import { TextBlock } from "./elements/text-block";
import { TodoBlock } from "./elements/todo-block";

interface BlockRendererProps {
  block: DocumentBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "link_preview":
      return <LinkPreviewBlock block={block} />;

    case "page":
      return <PageBlock block={block} />;

    case "quote":
      return <QuoteBlock block={block} />;

    case "image":
      return <ImageBlock block={block} />;

    case "todo":
      return <TodoBlock block={block} />;

    case "callout":
      return <CalloutBlock block={block} />;

    case "code":
      return <CodeBlock block={block} />;

    case "table":
      return <TableBlock block={block} />;

    case "paragraph":
      return <TextBlock block={block} />;

    default:
      return <TextBlock block={block} />;
  }
}
