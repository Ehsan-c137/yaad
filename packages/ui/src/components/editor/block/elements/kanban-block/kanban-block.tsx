"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";

import type { KanbanBlockProps, KanbanCard, KanbanColumn } from "./types";

import { KanbanColumnItem } from "./kanban-column";
import { KanbanActionsProvider } from "./kanban-context";
import { useKanbanData } from "./use-kanban-data";
import { useKanbanDragAndDrop } from "./use-kanban-dnd";

export type { KanbanBlockProps, KanbanCard, KanbanColumn };

export function KanbanBlock({ block }: KanbanBlockProps) {
  const {
    columns,
    cards,
    addColumn,
    deleteColumn,
    updateColumnTitle,
    addCard,
    deleteCard,
    updateCardTitle,
    moveCard,
    reorderCardColumn,
  } = useKanbanData(block);

  const { draggedCardId, handleDragStart, handleDragOver, handleDrop } =
    useKanbanDragAndDrop(reorderCardColumn);

  const actionsValue = useMemo(
    () => ({
      addColumn,
      deleteColumn,
      updateColumnTitle,
      addCard,
      deleteCard,
      updateCardTitle,
      moveCard,
      draggedCardId,
      handleDragStart,
      handleDragOver,
      handleDrop,
    }),
    [
      addColumn,
      deleteColumn,
      updateColumnTitle,
      addCard,
      deleteCard,
      updateCardTitle,
      moveCard,
      draggedCardId,
      handleDragStart,
      handleDragOver,
      handleDrop,
    ],
  );

  return (
    <KanbanActionsProvider value={actionsValue}>
      <div className="max-w-[100%] mx-auto">
        <div className="group/kanban overflow-x-auto my-4 select-none rounded-xl border border-border bg-card/40 p-4 shadow-sm gap-2 space-y-2 mx-auto ">
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus className="size-3.5" />
            Add column
          </Button>
          <div className="flex items-start gap-4 pb-2">
            {columns.map((col, colIdx) => (
              <KanbanColumnItem
                key={col.id}
                column={col}
                cards={cards}
                isFirstCol={colIdx === 0}
                isLastCol={colIdx === columns.length - 1}
                totalColumns={columns.length}
              />
            ))}
          </div>
        </div>
      </div>
    </KanbanActionsProvider>
  );
}
