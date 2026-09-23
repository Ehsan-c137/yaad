"use client";

import { createContext, useContext } from "react";

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

const KanbanActionsContext = createContext<KanbanActionsContextType | null>(
  null,
);
KanbanActionsContext.displayName = "KanbanActionsContext";

export function KanbanActionsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: KanbanActionsContextType;
}) {
  return (
    <KanbanActionsContext.Provider value={value}>
      {children}
    </KanbanActionsContext.Provider>
  );
}

export function useKanbanActions(): KanbanActionsContextType {
  const context = useContext(KanbanActionsContext);

  if (!context) {
    throw new Error(
      "useKanbanActions must be used within a KanbanActionsProvider",
    );
  }

  return context;
}
