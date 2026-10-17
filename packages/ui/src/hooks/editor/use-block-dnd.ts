import type React from "react";

import { collectSubTreeForDeletion } from "@yaad/core/store/document/helpers";
import { useCallback, useSyncExternalStore } from "react";

import { useDocumentStore } from "./use-document-store-ui";

export type BlockDropPosition = "after" | "before";

export interface BlockDndState {
  draggedBlockId: string | null;
  dropTargetId: string | null;
  dropPosition: BlockDropPosition | null;
}

let blockDndState: BlockDndState = {
  draggedBlockId: null,
  dropTargetId: null,
  dropPosition: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setBlockDndState(next: Partial<BlockDndState>) {
  blockDndState = { ...blockDndState, ...next };
  emitChange();
}

export function resetBlockDndState() {
  blockDndState = {
    draggedBlockId: null,
    dropTargetId: null,
    dropPosition: null,
  };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getBlockDndSnapshot(): BlockDndState {
  return blockDndState;
}

export function useBlockDndStore(): BlockDndState {
  return useSyncExternalStore(
    subscribe,
    getBlockDndSnapshot,
    getBlockDndSnapshot,
  );
}

export function useBlockDnd(blockId: string, isReadOnly: boolean) {
  const { draggedBlockId, dropTargetId, dropPosition } = useBlockDndStore();
  const moveBlock = useDocumentStore((state) => state.moveBlock);
  const currentDocument = useDocumentStore((state) => state.currentDocument);

  const isDragging = draggedBlockId === blockId;
  const isDropTarget = dropTargetId === blockId;
  const activePosition = isDropTarget ? dropPosition : null;

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (isReadOnly) {
        e.preventDefault();
        return;
      }

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/x-yaad-block", blockId);
      e.dataTransfer.setData("text/plain", blockId);

      // Set ghost preview image to the full block row if present
      if (
        typeof window !== "undefined" &&
        typeof e.dataTransfer.setDragImage === "function"
      ) {
        const row = document.getElementById(blockId);

        if (row) {
          const rect = row.getBoundingClientRect();
          const clientX = typeof e.clientX === "number" ? e.clientX : 0;
          const clientY = typeof e.clientY === "number" ? e.clientY : 0;
          const offsetX = Math.max(
            0,
            Math.min(rect.width, clientX - rect.left),
          );
          const offsetY = Math.max(
            0,
            Math.min(rect.height, clientY - rect.top),
          );

          try {
            e.dataTransfer.setDragImage(row, offsetX, offsetY);
          } catch {
            // Silently ignore if setDragImage throws
          }
        }
      }

      setBlockDndState({ draggedBlockId: blockId });
    },
    [isReadOnly, blockId],
  );

  const handleDragEnd = useCallback(() => {
    resetBlockDndState();
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (isReadOnly) return;

      const transferData =
        typeof e.dataTransfer.getData === "function"
          ? e.dataTransfer.getData("application/x-yaad-block") ||
            e.dataTransfer.getData("text/plain") ||
            null
          : null;
      const currentDragged = blockDndState.draggedBlockId ?? transferData;

      // Cannot drop on itself
      if (!currentDragged || currentDragged === blockId) {
        e.dataTransfer.dropEffect = "none";
        return;
      }

      // Prevent dropping into its own descendant
      if (currentDocument?.blocks) {
        const { blocksToDelete: descendants } = collectSubTreeForDeletion(
          currentDragged,
          currentDocument.blocks,
        );

        if (descendants.has(blockId)) {
          e.dataTransfer.dropEffect = "none";
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const clientY = typeof e.clientY === "number" ? e.clientY : 0;
      const top = typeof rect.top === "number" ? rect.top : 0;
      const height = rect.height || 1;
      const offsetY = clientY - top;
      const ratio = offsetY / height;

      const pos: BlockDropPosition = ratio < 0.5 ? "before" : "after";

      if (
        blockDndState.dropTargetId !== blockId ||
        blockDndState.dropPosition !== pos
      ) {
        setBlockDndState({ dropTargetId: blockId, dropPosition: pos });
      }
    },
    [isReadOnly, blockId, currentDocument],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.stopPropagation();
      const nextTarget = e.relatedTarget as Node | null;

      if (nextTarget && e.currentTarget.contains(nextTarget)) {
        return;
      }

      if (blockDndState.dropTargetId === blockId) {
        setBlockDndState({ dropTargetId: null, dropPosition: null });
      }
    },
    [blockId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isReadOnly) {
        resetBlockDndState();
        return;
      }

      const transferData =
        typeof e.dataTransfer.getData === "function"
          ? e.dataTransfer.getData("application/x-yaad-block") ||
            e.dataTransfer.getData("text/plain") ||
            null
          : null;
      const currentDragged = blockDndState.draggedBlockId ?? transferData;
      const pos = blockDndState.dropPosition ?? "after";

      if (currentDragged && currentDragged !== blockId) {
        if (currentDocument?.blocks) {
          const { blocksToDelete: descendants } = collectSubTreeForDeletion(
            currentDragged,
            currentDocument.blocks,
          );

          if (!descendants.has(blockId)) {
            void moveBlock(currentDragged, blockId, pos);
          }
        } else {
          void moveBlock(currentDragged, blockId, pos);
        }
      }

      resetBlockDndState();
    },
    [isReadOnly, blockId, currentDocument, moveBlock],
  );

  return {
    isDragging,
    isDropTarget,
    activePosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
