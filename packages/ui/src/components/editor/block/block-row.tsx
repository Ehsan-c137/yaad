import { Button } from "@ui/button";
import { GripVertical, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

import { BlockActionMenu } from "../menu/block-action-menu";
import { COLOR_OPTIONS } from "../menu/menu-constants";
import { BlockRenderer } from "./block-renderer";
import { BlockTags } from "./block-tags";

interface BlockRowProps {
  blockId: string;
}

export function BlockRow({ blockId }: BlockRowProps) {
  const { t } = useTranslation("editor");
  const block = useDocumentStore(
    (state) => state.currentDocument?.blocks[blockId],
  );
  const addBlock = useDocumentStore((state) => state.addBlock);
  const setActiveBlockId = useDocumentStore((state) => state.setActiveBlockId);

  if (!block) return null;

  const bgColor = block.properties?.bgColor;
  const backgroundStyle = COLOR_OPTIONS.find(
    (color) => color.name.toLowerCase() === bgColor?.toLowerCase(),
  );

  return (
    <div
      onKeyDown={() => {
        // TODO: fix this
      }}
      onFocus={() => setActiveBlockId(block.id)}
      onClick={() => setActiveBlockId(block.id)}
      className={cn(
        "group relative flex min-h-8 w-full items-start rounded-lg px-2 transition-colors md:px-1 mx-auto max-w-3xl",
        backgroundStyle?.bgClass,
        backgroundStyle?.bgClass ? "hover:saturate-200" : "hover:bg-accent/40",
      )}
    >
      <div
        contentEditable={false}
        className="hidden md:flex absolute bottom-0 ltr:md:-left-15 rtl:md:-right-15 items-center gap-0.5 opacity-0 spring transition-opacity select-none group-focus-within:opacity-100 group-hover:opacity-100 focus-within:opacity-100"
      >
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            void addBlock(block.parentId ?? "root", block.id, "paragraph")
          }
          title={t("addBlockBelow")}
          tooltipSide="bottom"
        >
          <Plus className="size-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="cursor-grab active:cursor-grabbing"
                title={t("openBlockOptions")}
                tooltipSide="bottom"
              >
                <GripVertical className="size-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent
            side="bottom"
            align="start"
            sideOffset={4}
            className="w-60 text-xs"
          >
            <BlockActionMenu block={block} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-3xl w-full mx-auto flex flex-col">
        <BlockTags tags={block.tags ?? []} blockId={blockId} />
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
