"use client";

import { DropdownMenuGroup, DropdownMenuSeparator } from "@ui/dropdown-menu";
import {
  Copy,
  ExternalLink,
  Sidebar as SidePeek,
  Star,
  Trash2,
} from "lucide-react";

import type { BlockActions } from "@/types/actions/block-actions";
import type { DocumentBlock } from "@/types/document";

import { useBlockActions } from "@/hooks/editor/use-block-actions";
import { useCopyBlockLink } from "@/hooks/editor/use-copy-block-link";
import { useOpenPageInNewTab } from "@/hooks/editor/use-open-page-in-new-tab";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import {
  getBlockIcon,
  getBlockLastEditedBy,
  getBlockPageId,
  getBlockSidePeekDocId,
  getBlockTitle,
} from "@/lib/block-metadata";

import type { BlockMenuAction } from "./block-menu-item";

import { BlockColorSubmenu } from "./block-color-submenu";
import { BlockMenuFooter } from "./block-menu-footer";
import { BlockMenuItem } from "./block-menu-item";
import { BlockMenuLabel } from "./block-menu-label";
import { BlockTurnIntoSubmenu } from "./block-turn-into-submenu";

interface BlockActionMenuProps {
  block: DocumentBlock;
}

export function BlockActionMenu({ block }: BlockActionMenuProps) {
  const {
    changeType,
    applyColor,
    duplicate,
    delete: deleteBlock,
  } = useBlockActions(block.id);
  const openPageInNewTab = useOpenPageInNewTab();
  const { openSidePeek } = useSidePeek();
  const copyLink = useCopyBlockLink(block.id);

  const actions: BlockActions = {
    changeType,
    applyColor,
    duplicate,
    delete: deleteBlock,
    copyLink,
    openInNewTab: () =>
      openPageInNewTab({
        pageId:
          block.properties.targetPageId ?? block.id ?? block.properties.pageId,
        title: block.properties.title?.[0]?.text ?? "untitled",
        icon: block.properties.icon,
      }),
    openInSidePeek: () => openSidePeek(getBlockSidePeekDocId(block)),
  };

  const blockActions: BlockMenuAction[] = [
    { id: "add-to-favorites", icon: Star, label: "Add to Favorites" },
  ];

  const documentActions: BlockMenuAction[] = [
    {
      id: "open-in-new-tab",
      icon: ExternalLink,
      label: "Open in new tab",
      shortcut: "Ctrl+Shift+↵",
      onSelect: actions.openInNewTab,
    },
    {
      id: "open-in-side-peek",
      icon: SidePeek,
      label: "Open in side peek",
      shortcut: "Alt+Click",
      onSelect: actions.openInSidePeek,
    },
  ];

  const linkActions: BlockMenuAction[] = [
    {
      id: "duplicate",
      icon: Copy,
      label: "Duplicate",
      shortcut: "Ctrl+D",
      onSelect: actions.duplicate,
    },
    {
      id: "move-to-trash",
      icon: Trash2,
      label: "Move to Trash",
      variant: "destructive",
      onSelect: actions.delete,
    },
  ];

  return (
    <>
      <DropdownMenuGroup>
        <BlockMenuLabel>Block</BlockMenuLabel>
        <BlockTurnIntoSubmenu onChangeType={actions.changeType} />
        <BlockColorSubmenu onApplyColor={actions.applyColor} />
        {blockActions.map((action) => (
          <BlockMenuItem key={action.id} action={action} />
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {documentActions.map((action) => (
          <BlockMenuItem key={action.id} action={action} />
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {linkActions.map((action) => (
          <BlockMenuItem key={action.id} action={action} />
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <BlockMenuFooter
        author={getBlockLastEditedBy(block)}
        updatedAt={block.updatedAt}
      />
    </>
  );
}
