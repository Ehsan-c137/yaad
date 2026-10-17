import { documentService } from "@yaad/core/services/document-service";
import { collectPageSubtree } from "@yaad/core/store/sidebar/helpers";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useEditorPermissions } from "@/context/use-editor-permissions";
import {
  resetBlockDndState,
  setBlockDndState,
  useBlockDndStore,
} from "@/hooks/editor/use-block-dnd";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import {
  resetDndState as resetSidebarDndState,
  useSidebarDndStore,
} from "@/hooks/sidebar/use-sidebar-dnd";
import { cn } from "@/lib/utils";

import { TestEditorStateInspector } from "./__dev__/test-editor-state-inspector";
import { BlockRow } from "./block/block-row";

export function BlockCanvas() {
  const { t } = useTranslation("editor");
  const { isReadOnly } = useEditorPermissions();
  const addBlock = useDocumentStore((state) => state.addBlock);
  const moveBlock = useDocumentStore((state) => state.moveBlock);
  const { draggedBlockId, dropTargetId } = useBlockDndStore();
  const { draggedPageId } = useSidebarDndStore();
  const currentDocId = useDocumentStore((state) => state.currentDocument?.id);
  const pages = useSidebarStore((s) => s.pages);

  const isDraggingItem = Boolean(
    draggedBlockId || (draggedPageId && draggedPageId !== currentDocId),
  );

  const childBlockIds = useDocumentStore(
    (state) => state.currentDocument?.blocks.root.childrenIds,
  );

  useEffect(() => {
    const handleAddBlock = async () => {
      await addBlock("root", "root", "paragraph");
    };

    // When a document is loaded and it has no blocks, add an initial paragraph block if permitted
    if (!isReadOnly && childBlockIds?.length === 0) {
      void handleAddBlock();
    }
  }, [childBlockIds, addBlock, isReadOnly]);

  const finalChildBlockIds = childBlockIds ?? [];

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;

    const timer = setTimeout(() => {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [childBlockIds]);

  if (!childBlockIds) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-1 px-4 py-6">
      {finalChildBlockIds.length === 0 ? (
        <div
          data-testid="block-canvas-empty-drop-zone"
          onDragOver={(e) => {
            if (isReadOnly) return;
            const droppedPageId =
              draggedPageId ??
              (typeof e.dataTransfer.getData === "function"
                ? e.dataTransfer.getData("application/x-yaad-page") || null
                : null);

            if (
              droppedPageId &&
              currentDocId &&
              droppedPageId !== currentDocId
            ) {
              const descendants = collectPageSubtree(pages, droppedPageId);

              if (!descendants.has(currentDocId)) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";

                if (dropTargetId !== "canvas-empty") {
                  setBlockDndState({
                    dropTargetId: "canvas-empty",
                    dropPosition: "after",
                  });
                }
              }
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();

            if (dropTargetId === "canvas-empty") {
              setBlockDndState({ dropTargetId: null, dropPosition: null });
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedPageId =
              draggedPageId ??
              (typeof e.dataTransfer.getData === "function"
                ? e.dataTransfer.getData("application/x-yaad-page") || null
                : null);

            if (
              droppedPageId &&
              currentDocId &&
              droppedPageId !== currentDocId
            ) {
              const descendants = collectPageSubtree(pages, droppedPageId);

              if (!descendants.has(currentDocId)) {
                void documentService.attachSubPageBlock(
                  currentDocId,
                  droppedPageId,
                  { position: "inside" },
                );
                void useSidebarStore
                  .getState()
                  .movePageInTree(droppedPageId, currentDocId, "inside");
              }
            }

            resetBlockDndState();
            resetSidebarDndState();
          }}
          className={cn(
            "rounded-lg p-4 transition-all",
            dropTargetId === "canvas-empty" &&
              "border-2 border-dashed border-(--accent-blue) bg-(--accent-blue-tint)",
          )}
        >
          <p className="text-sm text-muted-foreground italic">
            {isReadOnly
              ? t("emptyPageReadOnly", "This page is empty.")
              : t(
                  "noBlocksYet",
                  'No blocks yet. Click "Add Initial Block" or press Enter in a block.',
                )}
          </p>
        </div>
      ) : (
        finalChildBlockIds.map((blockId: string) => (
          <BlockRow key={blockId} blockId={blockId} />
        ))
      )}

      {!isReadOnly && isDraggingItem && finalChildBlockIds.length > 0 && (
        <div
          data-testid="block-canvas-bottom-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";

            if (dropTargetId !== "canvas-bottom") {
              setBlockDndState({
                dropTargetId: "canvas-bottom",
                dropPosition: "after",
              });
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();

            if (dropTargetId === "canvas-bottom") {
              setBlockDndState({ dropTargetId: null, dropPosition: null });
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (draggedBlockId) {
              const lastBlockId =
                finalChildBlockIds[finalChildBlockIds.length - 1];

              if (lastBlockId && lastBlockId !== draggedBlockId) {
                void moveBlock(draggedBlockId, lastBlockId, "after");
              } else {
                void moveBlock(draggedBlockId, "root", "after");
              }

              resetBlockDndState();
              return;
            }

            const pageTransferData =
              typeof e.dataTransfer.getData === "function"
                ? e.dataTransfer.getData("application/x-yaad-page") || null
                : null;
            const droppedPageId = draggedPageId ?? pageTransferData;

            if (
              droppedPageId &&
              currentDocId &&
              droppedPageId !== currentDocId
            ) {
              const descendants = collectPageSubtree(pages, droppedPageId);

              if (!descendants.has(currentDocId)) {
                const lastBlockId =
                  finalChildBlockIds[finalChildBlockIds.length - 1];
                void documentService.attachSubPageBlock(
                  currentDocId,
                  droppedPageId,
                  { position: "after", targetBlockId: lastBlockId },
                );
                void useSidebarStore
                  .getState()
                  .movePageInTree(droppedPageId, currentDocId, "inside");
              }

              resetBlockDndState();
              resetSidebarDndState();
              return;
            }

            const transferData =
              typeof e.dataTransfer.getData === "function"
                ? e.dataTransfer.getData("application/x-yaad-block") ||
                  e.dataTransfer.getData("text/plain") ||
                  null
                : null;
            const currentDragged = transferData;

            if (currentDragged) {
              const lastBlockId =
                finalChildBlockIds[finalChildBlockIds.length - 1];

              if (lastBlockId && lastBlockId !== currentDragged) {
                void moveBlock(currentDragged, lastBlockId, "after");
              } else {
                void moveBlock(currentDragged, "root", "after");
              }
            }

            resetBlockDndState();
          }}
          className={cn(
            "w-full h-12 transition-all rounded-lg flex items-center justify-center my-2",
            dropTargetId === "canvas-bottom"
              ? "border-2 border-dashed border-(--accent-blue) bg-(--accent-blue-tint)"
              : "border border-dashed border-transparent hover:border-border/40",
          )}
        >
          {dropTargetId === "canvas-bottom" && (
            <span className="text-xs text-primary font-medium">
              {t("dropAtBottom", "Drop at bottom")}
            </span>
          )}
        </div>
      )}

      {import.meta.env.DEV && <TestEditorStateInspector />}
    </div>
  );
}
