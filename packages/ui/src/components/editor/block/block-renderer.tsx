"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { lazy, Suspense } from "react";

import { BulletListBlock } from "./elements/bullet-list-block";
import { CalloutBlock } from "./elements/callout-block";
import { ImageBlock } from "./elements/image-block";
import { LinkPreviewBlock } from "./elements/link-preview-block";
import { PageBlock } from "./elements/page-block";
import { QuoteBlock } from "./elements/quote-block";
import { SeparatorBlock } from "./elements/seperator-block";
import { TableBlock } from "./elements/table-block";
import { TextBlock } from "./elements/text-block";
import { TodoBlock } from "./elements/todo-block";

const CodeBlock = lazy(() =>
  import("./elements/code-block").then((module) => ({
    default: module.CodeBlock,
  })),
);

const KanbanBlock = lazy(() =>
  import("./elements/kanban-block/kanban-block").then((m) => ({
    default: m.KanbanBlock,
  })),
);

interface BlockRendererProps {
  block: DocumentBlock;
}

/* eslint-disable complexity */
export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "separator":

    case "seperator":
      return <SeparatorBlock />;

    case "link_preview":
      return <LinkPreviewBlock block={block} />;

    case "bulleted_list":
      return <BulletListBlock block={block} />;

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
      return (
        <Suspense
          fallback={
            <div className="w-full h-full bg-background animate-pulse" />
          }
        >
          <CodeBlock block={block} />
        </Suspense>
      );

    case "table":
      return <TableBlock block={block} />;

    case "kanban":
      return (
        <Suspense fallback={null}>
          <KanbanBlock block={block} />
        </Suspense>
      );

    case "paragraph":

    case "heading_1":

    case "heading_2":

    case "heading_3":
      return <TextBlock block={block} />;

    default:
      return <TextBlock block={block} />;
  }
}
