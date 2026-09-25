"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import {
  getBlockPageId,
  getBlockSidePeekDocId,
  getBlockTitle,
} from "@yaad/core/lib/block-metadata";
import {
  Copy,
  ExternalLink,
  GripVertical,
  Paintbrush,
  Repeat,
  Sidebar as SidePeek,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerSwipeHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useBlockActions } from "@/hooks/editor/use-block-actions";
import { useCopyBlockLink } from "@/hooks/editor/use-copy-block-link";
import { useOpenPageInNewTab } from "@/hooks/editor/use-open-page-in-new-tab";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { cn } from "@/lib/utils";

import { TagPickerPopover } from "../tags/tag-picker-popover";
import { COLOR_OPTIONS, TURN_INTO_OPTIONS } from "./menu-constant";

interface MobileBlockDrawerProps {
  block: DocumentBlock;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pageId?: string;
}

export function MobileBlockDrawer({
  block,
  trigger,
  open,
  onOpenChange,
  pageId: propPageId,
}: MobileBlockDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const contextPageId = useEditorPageIdContext();
  const { pageId: routePageId } = useParams();
  const pageId = (propPageId || contextPageId || routePageId) ?? "";
  const actions = useBlockActions(block.id, pageId);
  const openPageInNewTab = useOpenPageInNewTab();
  const { openSidePeek } = useSidePeek();
  const copyLink = useCopyBlockLink(block.id);

  const currentTypeInfo = TURN_INTO_OPTIONS.find((t) => t.type === block.type);
  const CurrentIcon = currentTypeInfo?.icon ?? GripVertical;
  const currentTypeName = currentTypeInfo?.label ?? "Block";

  const handleTurnInto = (type: (typeof TURN_INTO_OPTIONS)[number]["type"]) => {
    actions.changeType(type);
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    actions.duplicate();
    setIsOpen(false);
  };

  const handleDelete = () => {
    actions.delete();
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    copyLink();
    setIsOpen(false);
  };

  const handleOpenInNewTab = () => {
    openPageInNewTab({
      pageId: getBlockPageId(block) || block.id,
      title: getBlockTitle(block),
      icon: block.properties?.icon,
    });
    setIsOpen(false);
  };

  const handleOpenInSidePeek = () => {
    openSidePeek(getBlockSidePeekDocId(block));
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DrawerTrigger render={trigger} />
      ) : (
        <DrawerTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95"
              title="Block options"
            >
              <GripVertical className="size-3.5" />
              <span>{currentTypeName}</span>
            </Button>
          }
        />
      )}

      <DrawerContent className="max-h-[85vh] overflow-y-auto px-4 pb-8 safe-area-pb">
        <DrawerSwipeHandle className="my-2" />

        <DrawerHeader>
          <div className="flex! items-center justify-between border-b border-border/40 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <CurrentIcon className="size-4" />
              </div>
              <div>
                <DrawerTitle className="text-sm font-semibold">
                  {currentTypeName}
                </DrawerTitle>
                <p className="text-[11px] text-muted-foreground">
                  Block actions
                </p>
              </div>
            </div>

            <DrawerClose
              render={
                <Button variant="ghost" size="icon-xs" className="rounded-full">
                  <X className="size-3.5" />
                </Button>
              }
            />
          </div>
        </DrawerHeader>

        <div className="flex flex-col gap-5 py-4">
          {/* Quick Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="justify-start gap-2 h-9 text-xs"
            >
              <Copy className="size-3.5 text-muted-foreground" />
              <span>Duplicate</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="justify-start gap-2 h-9 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <Trash2 className="size-3.5 text-destructive" />
              <span>Delete block</span>
            </Button>
          </div>

          {/* Turn into section */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Repeat className="size-3.5" />
              <span>Turn into</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {TURN_INTO_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = block.type === item.type;
                return (
                  <Button
                    key={item.type}
                    variant={isSelected ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleTurnInto(item.type)}
                    className={cn(
                      "justify-start gap-2 h-9 px-2.5 text-xs border border-transparent",
                      isSelected &&
                        "border-primary/20 bg-primary/10 font-semibold text-primary",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Color palette */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Paintbrush className="size-3.5" />
              <span>Background Color</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((color) => {
                const isSelected =
                  (block.properties?.bgColor ?? "default").toLowerCase() ===
                  color.name.toLowerCase();
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() =>
                      actions.applyColor({
                        bgColor: color.name.toLowerCase(),
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1.5 text-xs transition-all active:scale-95",
                      color.bgClass,
                      isSelected && "ring-2 ring-primary ring-offset-1",
                    )}
                  >
                    <span
                      className={cn(
                        "size-3 rounded-full border border-border",
                        color.bgClass,
                      )}
                    />
                    <span className={color.textClass}>{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TagIcon className="size-3.5" />
              <span>Tags</span>
            </div>
            <TagPickerPopover
              selectedTags={block.tags ?? []}
              onAddTag={actions.addTag}
              onRemoveTag={actions.removeTag}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between h-9 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <TagIcon className="size-3.5 text-muted-foreground" />
                    <span>Manage tags</span>
                  </div>
                  {(block.tags?.length ?? 0) > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {block.tags?.length} tags
                    </span>
                  )}
                </Button>
              }
            />
          </div>

          {/* Document Navigation Actions */}
          <div className="flex flex-col gap-1 border-t border-border/40 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="size-3.5" />
              <span>Copy link to block</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInNewTab}
              className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              <span>Open in new tab</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInSidePeek}
              className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <SidePeek className="size-3.5" />
              <span>Open in side peek</span>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
