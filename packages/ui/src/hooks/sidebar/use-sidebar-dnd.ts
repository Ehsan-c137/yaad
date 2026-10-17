import type { DropPosition } from "@yaad/core/store/use-sidebar-store";

import { collectPageSubtree } from "@yaad/core/store/sidebar/helpers";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useCallback, useRef, useSyncExternalStore } from "react";

export interface SidebarDndState {
  draggedPageId: string | null;
  dropTargetId: string | null;
  dropPosition: DropPosition | null;
}

let dndState: SidebarDndState = {
  draggedPageId: null,
  dropTargetId: null,
  dropPosition: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setDndState(next: Partial<SidebarDndState>) {
  dndState = { ...dndState, ...next };
  emitChange();
}

export function resetDndState() {
  dndState = {
    draggedPageId: null,
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

function getSnapshot(): SidebarDndState {
  return dndState;
}

export function useSidebarDndStore(): SidebarDndState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSidebarPageDnd(pageId: string, isReadOnly: boolean) {
  const { draggedPageId, dropTargetId, dropPosition } = useSidebarDndStore();
  const pages = useSidebarStore((s) => s.pages);
  const movePageInTree = useSidebarStore((s) => s.movePageInTree);
  const toggleExpand = useSidebarStore((s) => s.toggleExpand);

  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDragging = draggedPageId === pageId;
  const isDropTarget = dropTargetId === pageId;
  const activePosition = isDropTarget ? dropPosition : null;

  const clearAutoExpandTimer = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (isReadOnly) {
        e.preventDefault();
        return;
      }

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", pageId);
      e.dataTransfer.setData("application/x-yaad-page", pageId);

      setDndState({ draggedPageId: pageId });
    },
    [isReadOnly, pageId],
  );

  const handleDragEnd = useCallback(() => {
    clearAutoExpandTimer();
    resetDndState();
  }, [clearAutoExpandTimer]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (isReadOnly) return;

      const transferData =
        e.dataTransfer.getData("application/x-yaad-page") ||
        e.dataTransfer.getData("text/plain") ||
        null;
      const currentDragged = dndState.draggedPageId ?? transferData;

      // Cannot drop on itself
      if (!currentDragged || currentDragged === pageId) {
        e.dataTransfer.dropEffect = "none";
        return;
      }

      // Check circular dependency: target cannot be a descendant of dragged page
      const descendants = collectPageSubtree(pages, currentDragged);

      if (descendants.has(pageId)) {
        e.dataTransfer.dropEffect = "none";
        return;
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

      let pos: DropPosition;

      if (ratio < 0.25) {
        pos = "before";
      } else if (ratio > 0.75) {
        pos = "after";
      } else {
        pos = "inside";
      }

      if (dndState.dropTargetId !== pageId || dndState.dropPosition !== pos) {
        setDndState({ dropTargetId: pageId, dropPosition: pos });
      }

      // Auto-expand folder when hovering inside for > 600ms
      if (pos === "inside") {
        const targetPage = pages[pageId];

        if (
          targetPage &&
          !targetPage.isExpanded &&
          !autoExpandTimerRef.current
        ) {
          autoExpandTimerRef.current = setTimeout(() => {
            toggleExpand(pageId);
          }, 600);
        }
      } else {
        clearAutoExpandTimer();
      }
    },
    [isReadOnly, pageId, pages, toggleExpand, clearAutoExpandTimer],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.stopPropagation();
      const nextTarget = e.relatedTarget as Node | null;

      if (nextTarget && e.currentTarget.contains(nextTarget)) {
        return;
      }

      clearAutoExpandTimer();

      if (dndState.dropTargetId === pageId) {
        setDndState({ dropTargetId: null, dropPosition: null });
      }
    },
    [clearAutoExpandTimer, pageId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      clearAutoExpandTimer();

      if (isReadOnly) {
        resetDndState();
        return;
      }

      const transferData =
        e.dataTransfer.getData("application/x-yaad-page") ||
        e.dataTransfer.getData("text/plain") ||
        null;
      const currentDragged = dndState.draggedPageId ?? transferData;

      const pos = dndState.dropPosition ?? "inside";

      if (currentDragged && currentDragged !== pageId) {
        const descendants = collectPageSubtree(pages, currentDragged);

        if (!descendants.has(pageId)) {
          void movePageInTree(currentDragged, pageId, pos);
        }
      }

      resetDndState();
    },
    [clearAutoExpandTimer, isReadOnly, movePageInTree, pageId, pages],
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
