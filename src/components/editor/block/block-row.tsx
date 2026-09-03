"use client";

import { Button } from "@ui/button";
import { GripVertical, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";

import { BlockActionMenu } from "../menu/block-action-menu";
import { COLOR_OPTIONS } from "../menu/menu-constant";
import { BlockRenderer } from "./block-renderer";

interface BlockRowProps {
  blockId: string;
}

export function BlockRow({ blockId }: BlockRowProps) {
  const block = useDocumentStore(
    (state) => state.currentDocument?.blocks[blockId],
  );
  const addBlock = useDocumentStore((state) => state.addBlock);

  if (!block) return null;

  const { bgColor } = block.properties;
  const backgroundStyle = COLOR_OPTIONS.find(
    (color) => color.name.toLocaleLowerCase() === bgColor?.toLowerCase(),
  );

  return (
    <div
      className={cn(
        "group relative flex min-h-8 w-full items-start rounded-lg pl-5 transition-colors hover:bg-accent/40 md:px-1",
        block.type === "bulleted_list" && "items-center",
      )}
    >
      <div
        contentEditable={false}
        className="absolute bottom-0 -left-7 flex items-center gap-0.5 opacity-0 transition-opacity select-none group-focus-within:opacity-100 group-hover:opacity-100 focus-within:opacity-100 md:-left-15"
      >
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            addBlock(block.parentId ?? "root", block.id, "paragraph")
          }
          title="Add block below"
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
                title="Open block options"
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

      <div
        className={cn(
          backgroundStyle?.bgClass,
          "min-w-0 flex-1 rounded-lg px-2",
        )}
      >
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
