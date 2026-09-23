import type { DocumentBlock } from "@yaad/core/types/document";

import { Heading, Image as ImageIcon, LayoutGrid, Table } from "lucide-react";

interface BlockPreviewContentProps {
  block: DocumentBlock;
}

function getTextContent(block: DocumentBlock): string {
  if (block.properties?.title && Array.isArray(block.properties.title)) {
    return block.properties.title
      .map((segment: { text?: string }) => segment.text || "")
      .join("");
  }
  if (typeof block.properties?.code === "string") {
    return block.properties.code;
  }
  if (typeof block.properties?.caption === "string") {
    return block.properties.caption;
  }

  return "";
}

function PreviewParagraph({ text }: { text: string }) {
  return (
    <p className="text-sm/relaxed text-foreground line-clamp-4">
      {text || (
        <span className="text-muted-foreground italic">Empty block</span>
      )}
    </p>
  );
}

function PreviewHeading({ text, level }: { text: string; level: 1 | 2 | 3 }) {
  const styles = {
    1: "text-lg font-bold",
    2: "text-base font-semibold",
    3: "text-sm font-medium",
  };

  return (
    <div className="flex items-center gap-1.5">
      <Heading className="size-3.5 shrink-0 text-amber-500" />
      <span className={`${styles[level]} text-foreground truncate`}>
        {text || "Untitled heading"}
      </span>
    </div>
  );
}

function PreviewCode({ text, language }: { text: string; language?: string }) {
  return (
    <div className="rounded-md border border-border bg-neutral-900 dark:bg-neutral-950 overflow-hidden">
      {language && (
        <div className="border-b border-border px-2.5 py-1 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
          {language}
        </div>
      )}
      <pre className="overflow-hidden p-2.5 font-mono text-xs/relaxed text-emerald-400 dark:text-emerald-300 line-clamp-5">
        {text || "// empty"}
      </pre>
    </div>
  );
}

function PreviewQuote({ text }: { text: string }) {
  return (
    <div className="border-l-3 border-indigo-400/80 pl-3">
      <p className="text-sm italic text-foreground/80 line-clamp-3">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

function PreviewCallout({ text, icon }: { text: string; icon?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-2.5">
      <span className="text-base shrink-0 select-none">{icon || "💡"}</span>
      <p className="text-sm text-foreground line-clamp-3">
        {text || (
          <span className="text-muted-foreground italic">Empty callout</span>
        )}
      </p>
    </div>
  );
}

function PreviewTodo({ text, checked }: { text: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
          checked ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {checked && (
          <svg
            className="size-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm truncate ${
          checked ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {text || "To-do"}
      </span>
    </div>
  );
}

function PreviewBulletList({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-1.5 shrink-0 rounded-full bg-foreground/70" />
      <span className="text-sm text-foreground truncate">
        {text || (
          <span className="text-muted-foreground italic">Empty item</span>
        )}
      </span>
    </div>
  );
}

function PreviewCompact({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function BlockPreviewContent({ block }: BlockPreviewContentProps) {
  const text = getTextContent(block);

  switch (block.type) {
    case "heading_1":
      return <PreviewHeading text={text} level={1} />;

    case "heading_2":
      return <PreviewHeading text={text} level={2} />;

    case "heading_3":
      return <PreviewHeading text={text} level={3} />;

    case "code":
      return <PreviewCode text={text} language={block.properties?.language} />;

    case "quote":
      return <PreviewQuote text={text} />;

    case "callout":
      return <PreviewCallout text={text} icon={block.properties?.icon} />;

    case "todo":
      return (
        <PreviewTodo text={text} checked={Boolean(block.properties?.checked)} />
      );

    case "bulleted_list":
      return <PreviewBulletList text={text} />;

    case "image":
      return (
        <PreviewCompact
          icon={<ImageIcon className="size-4 text-blue-500" />}
          label={block.properties?.fileName || "Image block"}
        />
      );

    case "table":
      return (
        <PreviewCompact
          icon={<Table className="size-4 text-sky-500" />}
          label="Table block"
        />
      );

    case "kanban":
      return (
        <PreviewCompact
          icon={<LayoutGrid className="size-4 text-cyan-500" />}
          label="Kanban board"
        />
      );

    case "paragraph":

    default:
      return <PreviewParagraph text={text} />;
  }
}
