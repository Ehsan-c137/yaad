/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from "@ui/button";
import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollabContext } from "@/context/use-collab";
import { useEditorPermissions } from "@/context/use-editor-permissions";
import { useBlockDnd } from "@/hooks/editor/use-block-dnd";
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
  const { isReadOnly } = useEditorPermissions();
  const [menuOpen, setMenuOpen] = useState(false);
  const block = useDocumentStore(
    (state) => state.currentDocument?.blocks[blockId],
  );
  const addBlock = useDocumentStore((state) => state.addBlock);
  const setActiveBlockId = useDocumentStore((state) => state.setActiveBlockId);
  const { peers, broadcastFocus } = useCollabContext();

  const {
    isDragging,
    isDropTarget,
    activePosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useBlockDnd(blockId, isReadOnly);

  if (!block) return null;

  const activePeersOnBlock = peers.filter((p) => p.activeBlockId === block.id);

  const bgColor = block.properties?.bgColor;
  const backgroundStyle = COLOR_OPTIONS.find(
    (color) => color.name.toLowerCase() === bgColor?.toLowerCase(),
  );

  return (
    <div
      id={block.id}
      data-testid={`block-row-${block.id}`}
      data-block-id={block.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onFocus={() => {
        setActiveBlockId(block.id);
        broadcastFocus(block.id);
      }}
      onClick={() => {
        setActiveBlockId(block.id);
        broadcastFocus(block.id);
      }}
      style={{
        borderLeftColor: activePeersOnBlock[0]?.color,
        borderLeftWidth: activePeersOnBlock.length > 0 ? "2.5px" : undefined,
      }}
      className={cn(
        "group relative flex min-h-8 w-full items-start rounded-lg px-2 transition-all md:px-1 mx-auto max-w-3xl",
        backgroundStyle?.bgClass,
        backgroundStyle?.bgClass ? "hover:saturate-200" : "hover:bg-accent/40",
        activePeersOnBlock.length > 0 &&
          "ring-1 ring-black/5 dark:ring-white/10",
        isDragging &&
          "opacity-40 scale-[0.99] border border-dashed border-primary/40",
      )}
    >
      {/* Drop Indicators */}
      {isDropTarget && activePosition === "before" && (
        <div
          data-testid="block-drop-indicator-before"
          className="pointer-events-none absolute -top-1 start-0 end-0 z-30 flex items-center"
        >
          <div className="size-2 rounded-full bg-(--accent-blue) ring-2 ring-background" />
          <div className="h-0.5 flex-1 rounded-full bg-(--accent-blue) shadow-[0_0_6px_var(--accent-blue)]" />
          <div className="size-2 rounded-full bg-(--accent-blue) ring-2 ring-background" />
        </div>
      )}

      {isDropTarget && activePosition === "after" && (
        <div
          data-testid="block-drop-indicator-after"
          className="pointer-events-none absolute -bottom-1 start-0 end-0 z-30 flex items-center"
        >
          <div className="size-2 rounded-full bg-(--accent-blue) ring-2 ring-background" />
          <div className="h-0.5 flex-1 rounded-full bg-(--accent-blue) shadow-[0_0_6px_var(--accent-blue)]" />
          <div className="size-2 rounded-full bg-(--accent-blue) ring-2 ring-background" />
        </div>
      )}

      {/* Collaborator Focus Indicators */}
      {activePeersOnBlock
        .filter((peer) => !peer.cursor)
        .map((peer) => (
          <div
            key={peer.id}
            className="absolute -top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm pointer-events-none transition-all z-20"
            style={{ backgroundColor: peer.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{peer.name}</span>
          </div>
        ))}

      {!isReadOnly && (
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

          <div
            draggable={!isReadOnly}
            onDragStart={(e) => {
              setMenuOpen(false);
              handleDragStart(e);
            }}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
            data-testid="block-drag-handle"
          >
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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
        </div>
      )}

      <div className="max-w-3xl w-full mx-auto flex flex-col">
        <BlockTags tags={block.tags ?? []} blockId={blockId} />
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
