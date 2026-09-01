"use client";

import { Button } from "@ui/button";
import { GripVertical, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className="group relative flex min-h-8 w-full items-start rounded-lg px-1 transition-colors hover:bg-accent/40">
      <div
        contentEditable={false}
        className="absolute bottom-0 -left-15 flex items-center gap-0.5 opacity-0 transition-opacity select-none group-hover:opacity-100"
      >
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            addBlock(block.parentId ?? "root", block.id, "paragraph")
          }
          title="Add block below"
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
        className={`${backgroundStyle?.bgClass}
          min-w-0 flex-1 rounded-lg px-2
        `}
      >
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
