"use client";

import type { BlockActions } from "@yaad/core/types/actions/block-actions";
import type { DocumentBlock } from "@yaad/core/types/document";

import { DropdownMenuGroup, DropdownMenuSeparator } from "@ui/dropdown-menu";
import {
  getBlockLastEditedBy,
  getBlockPageId,
  getBlockSidePeekDocId,
  getBlockTitle,
} from "@yaad/core/lib/block-metadata";
import { Copy, ExternalLink, Sidebar as SidePeek, Trash2 } from "lucide-react";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useBlockActions } from "@/hooks/editor/use-block-actions";
import { useCopyBlockLink } from "@/hooks/editor/use-copy-block-link";
import { useOpenPageInNewTab } from "@/hooks/editor/use-open-page-in-new-tab";
import { useSidePeek } from "@/hooks/editor/use-side-peek";

import type { BlockMenuAction } from "./block-menu-item";

import { BlockColorSubmenu } from "./block-color-submenu";
import { BlockMenuFooter } from "./block-menu-footer";
import { BlockMenuItem } from "./block-menu-item";
import { BlockMenuLabel } from "./block-menu-label";
import { BlockTagMenu } from "./block-tag-menu";
import { BlockTurnIntoSubmenu } from "./block-turn-into-submenu";

interface BlockActionMenuProps {
  block: DocumentBlock;
}

export function BlockActionMenu({ block }: BlockActionMenuProps) {
  const pageId = useEditorPageIdContext();
  const {
    changeType,
    applyColor,
    duplicate,
    delete: deleteBlock,
    updateTags,
    addTag,
    removeTag,
  } = useBlockActions(block.id, pageId);
  const openPageInNewTab = useOpenPageInNewTab();
  const { openSidePeek } = useSidePeek();
  const copyLink = useCopyBlockLink(block.id);

  const actions: BlockActions = {
    changeType,
    applyColor,
    duplicate,
    delete: deleteBlock,
    updateTags,
    addTag,
    removeTag,
    copyLink,
    openInNewTab: () =>
      openPageInNewTab({
        pageId: getBlockPageId(block) || block.id,
        title: getBlockTitle(block),
        icon: block.properties.icon,
      }),
    openInSidePeek: () => openSidePeek(getBlockSidePeekDocId(block)),
  };

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
      id: "delete",
      icon: Trash2,
      label: "delete",
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
        <BlockTagMenu
          blockTags={block.tags ?? []}
          onRemoveTag={actions.removeTag}
          onAddTag={actions.addTag}
        />
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
