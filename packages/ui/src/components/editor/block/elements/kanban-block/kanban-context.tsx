"use client";

import { createContext, use } from "react";

export interface KanbanActionsContextType {
  // Column actions
  addColumn: () => void;
  deleteColumn: (colId: string) => void;
  updateColumnTitle: (colId: string, title: string) => void;

  // Card actions
  addCard: (columnId: string, title: string) => void;
  deleteCard: (cardId: string) => void;
  updateCardTitle: (cardId: string, title: string) => void;
  moveCard: (cardId: string, direction: "left" | "right") => void;

  // Drag & Drop actions
  draggedCardId: string | null;
  handleDragStart: (e: React.DragEvent, cardId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetColumnId: string) => void;
}

export const KanbanActionsContext =
  createContext<KanbanActionsContextType | null>(null);

KanbanActionsContext.displayName = "KanbanActionsContext";

export function useKanbanActions(): KanbanActionsContextType {
  const context = use(KanbanActionsContext);

  if (!context) {
    throw new Error(
      "useKanbanActions must be used within a KanbanActionsProvider",
    );
  }

  return context;
}
