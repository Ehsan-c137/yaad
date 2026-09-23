import type { DocumentBlockType } from "@yaad/core/types/document";
import type { SearchItem } from "@yaad/core/types/search";
import type { ReactNode } from "react";

import {
  AlertCircle,
  CheckSquare,
  Code2,
  CornerDownLeft,
  FileText,
  Heading,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Quote,
  Table,
  Tag as TagIcon,
} from "lucide-react";

import { TagBadge } from "@/components/editor/tags/tag-badge";
import { CommandItem } from "@/components/ui/command";

export interface SearchItemRowProps {
  item: SearchItem;
  onSelect: (item: SearchItem) => void;
}

interface BlockTypeMeta {
  icon: ReactNode;
  label: string;
  iconBg: string;
  iconColor: string;
}

const BLOCK_TYPE_CONFIG: Partial<Record<DocumentBlockType, BlockTypeMeta>> = {
  paragraph: {
    icon: <FileText className="size-3.5" />,
    label: "Text",
    iconBg: "bg-slate-500/15",
    iconColor: "text-slate-400",
  },
  code: {
    icon: <Code2 className="size-3.5" />,
    label: "Code",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  image: {
    icon: <ImageIcon className="size-3.5" />,
    label: "Image",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  todo: {
    icon: <CheckSquare className="size-3.5" />,
    label: "To-do",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  heading_1: {
    icon: <Heading className="size-3.5" />,
    label: "Heading",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  heading_2: {
    icon: <Heading className="size-3.5" />,
    label: "Heading",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  heading_3: {
    icon: <Heading className="size-3.5" />,
    label: "Heading",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  callout: {
    icon: <AlertCircle className="size-3.5" />,
    label: "Callout",
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
  },
  quote: {
    icon: <Quote className="size-3.5" />,
    label: "Quote",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
  },
  kanban: {
    icon: <LayoutGrid className="size-3.5" />,
    label: "Kanban",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
  },
  table: {
    icon: <Table className="size-3.5" />,
    label: "Table",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
  },
  bulleted_list: {
    icon: <List className="size-3.5" />,
    label: "List",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
};

function getBlockMeta(type?: DocumentBlockType): BlockTypeMeta | null {
  if (!type) return null;
  return (
    BLOCK_TYPE_CONFIG[type] ?? {
      icon: <FileText className="size-3.5" />,
      label: type,
      iconBg: "bg-muted/60",
      iconColor: "text-muted-foreground",
    }
  );
}

function parseSnippet(raw?: string): string {
  if (!raw) return "";
  return raw.replace(
    /^(code|image|todo|heading_\d|bulleted_list|callout|kanban|paragraph|quote|table):\s*/i,
    "",
  );
}

function resolveSnippet(item: SearchItem): string {
  const tagMeta = item.tag?.metadata;
  const rawSubtitle = item.subtitle;
  const isGeneric =
    !rawSubtitle ||
    /^\d+ tagged block/i.test(rawSubtitle) ||
    rawSubtitle === "Filter pages by tag";

  const raw =
    tagMeta?.snippet ||
    tagMeta?.locations?.[0]?.snippet ||
    (!isGeneric ? rawSubtitle : "");

  return parseSnippet(raw);
}

function LeadingIcon({
  item,
  blockMeta,
}: {
  item: SearchItem;
  blockMeta: BlockTypeMeta | null;
}) {
  const isTag = item.category === "tag";

  if (isTag && item.tag) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center">
        <TagBadge tag={item.tag} size="sm" />
      </div>
    );
  }

  if (blockMeta) {
    return (
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${blockMeta.iconBg} ${blockMeta.iconColor}`}
      >
        {blockMeta.icon}
      </div>
    );
  }

  if (item.icon) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-base leading-none select-none">
        {item.icon}
      </div>
    );
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full p-1 bg-muted/50">
      {isTag ? (
        <TagIcon className="size-3.5 text-muted-foreground" />
      ) : (
        <FileText className="size-3.5 text-muted-foreground" />
      )}
    </div>
  );
}

function RightLabel({
  item,
  blockMeta,
}: {
  item: SearchItem;
  blockMeta: BlockTypeMeta | null;
}) {
  const isTag = item.category === "tag";

  const pageTitle =
    item.tag?.metadata?.pageTitle ||
    item.tag?.metadata?.locations?.[0]?.pageTitle;

  if (isTag && pageTitle) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground/55 group-data-[selected=true]:text-muted-foreground/80 transition-colors">
        <FileText className="size-3 shrink-0" />
        <span className="max-w-[130px] truncate">{pageTitle}</span>
      </span>
    );
  }

  if (blockMeta) {
    return (
      <span
        className={`shrink-0 text-[12px] ${blockMeta.iconColor} opacity-50 group-data-[selected=true]:opacity-80 transition-opacity`}
      >
        {isTag ? `in ${blockMeta.label}` : blockMeta.label}
      </span>
    );
  }

  return null;
}

export function SearchItemRow({ item, onSelect }: SearchItemRowProps) {
  const isBlock = item.category === "block" || !!item.blockType;

  const attachedType =
    item.blockType ||
    item.tag?.metadata?.blockType ||
    item.tag?.metadata?.locations?.[0]?.blockType;

  const blockMeta = getBlockMeta(isBlock ? item.blockType : attachedType);
  const snippet = resolveSnippet(item);

  return (
    <CommandItem
      value={`${item.title} ${item.subtitle ?? ""} ${item.pageId || item.id}`}
      onSelect={() => onSelect(item)}
      className="group flex justify-between  cursor-pointer items-center gap-3 px-2 py-1.5 transition-colors duration-75 hover:bg-accent/60 data-[selected=true]:bg-accent select-none"
    >
      <div className="px-3">
        <LeadingIcon item={item} blockMeta={blockMeta} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium leading-snug text-foreground/85 group-hover:text-foreground group-data-[selected=true]:text-foreground transition-colors">
          {item.title}
        </span>

        {snippet && (
          <span className="truncate text-[11px] leading-none text-muted-foreground/50 group-data-[selected=true]:text-muted-foreground/65 transition-colors">
            {snippet}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <RightLabel item={item} blockMeta={blockMeta} />

        <span className="hidden group-data-[selected=true]:flex items-center rounded border border-border/50 bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground/60">
          <CornerDownLeft className="size-2.5" />
        </span>
      </div>
    </CommandItem>
  );
}
