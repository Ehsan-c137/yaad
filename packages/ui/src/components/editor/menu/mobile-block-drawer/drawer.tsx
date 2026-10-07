"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import {
  getBlockLastEditedBy,
  getBlockPageId,
  getBlockSidePeekDocId,
  getBlockTitle,
} from "@yaad/core/lib/block-metadata";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

import {
  Drawer,
  DrawerContent,
  DrawerSwipeHandle,
} from "@/components/ui/drawer";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useBlockActions } from "@/hooks/editor/use-block-actions";
import { useCopyBlockLink } from "@/hooks/editor/use-copy-block-link";
import { useOpenPageInNewTab } from "@/hooks/editor/use-open-page-in-new-tab";
import { useSidePeek } from "@/hooks/editor/use-side-peek";

import { BlockMenuFooter } from "../block-menu-footer";
import { TURN_INTO_OPTIONS } from "../menu-constants";
import { MobileColorSection } from "./color-section";
import { MobileBlockDrawerHeader } from "./drawer-header";
import { MobileBlockDrawerTrigger } from "./drawer-trigger";
import { MobileNavigationSection } from "./navigation-section";
import { MobileQuickActions } from "./quick-actions";
import { MobileTagsSection } from "./tags-section";
import { MobileTurnIntoSection } from "./turn-into-section";

export interface MobileBlockDrawerProps {
  block: DocumentBlock;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pageId?: string;
}

function resolvePageId(
  propPageId?: string,
  contextPageId?: string,
  routePageId?: string,
): string {
  if (propPageId) return propPageId;
  if (contextPageId) return contextPageId;
  if (routePageId) return routePageId;
  return "";
}

export function MobileBlockDrawer({
  block,
  trigger,
  open,
  onOpenChange,
  pageId: propPageId,
}: MobileBlockDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const contextPageId = useEditorPageIdContext();
  const { pageId: routePageId } = useParams();
  const pageId = resolvePageId(propPageId, contextPageId, routePageId);

  const actions = useBlockActions(block.id, pageId);
  const openPageInNewTab = useOpenPageInNewTab();
  const { openSidePeek } = useSidePeek();
  const copyLink = useCopyBlockLink(block.id);

  const currentTypeInfo = TURN_INTO_OPTIONS.find(
    (option) => option.type === block.type,
  );
  const CurrentIcon = currentTypeInfo?.icon ?? GripVertical;
  const currentTypeName = currentTypeInfo?.label ?? "Block";

  const closeAndRun = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleOpenInNewTab = () => {
    closeAndRun(() =>
      openPageInNewTab({
        pageId: getBlockPageId(block) || block.id,
        title: getBlockTitle(block),
        icon: block.properties?.icon,
      }),
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <MobileBlockDrawerTrigger trigger={trigger} typeName={currentTypeName} />

      <DrawerContent className="max-h-[85vh] overflow-y-auto px-4 pb-8 safe-area-pb">
        <DrawerSwipeHandle className="my-2" />

        <MobileBlockDrawerHeader
          typeName={currentTypeName}
          icon={CurrentIcon}
        />

        <div className="flex flex-col gap-5 py-4">
          <MobileQuickActions
            onDuplicate={() => closeAndRun(actions.duplicate)}
            onDelete={() => closeAndRun(actions.delete)}
          />

          <MobileTurnIntoSection
            currentType={block.type}
            onSelectType={(type) => closeAndRun(() => actions.changeType(type))}
          />

          <MobileColorSection
            selectedColor={block.properties?.bgColor}
            onSelectColor={(bgColor) => actions.applyColor({ bgColor })}
          />

          <MobileTagsSection
            tags={block.tags}
            onAddTag={actions.addTag}
            onRemoveTag={actions.removeTag}
          />

          <MobileNavigationSection
            onCopyLink={() => closeAndRun(copyLink)}
            onOpenInNewTab={handleOpenInNewTab}
            onOpenInSidePeek={() =>
              closeAndRun(() => openSidePeek(getBlockSidePeekDocId(block)))
            }
          />

          {block.updatedAt ? (
            <div className="border-t border-border/40 pt-2">
              <BlockMenuFooter
                author={getBlockLastEditedBy(block)}
                updatedAt={block.updatedAt}
              />
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
