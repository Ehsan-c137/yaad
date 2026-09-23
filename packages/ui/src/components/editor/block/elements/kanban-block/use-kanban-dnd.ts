import { useState } from "react";

export function useKanbanDragAndDrop(
  onDropCardToColumn: (cardId: string, targetColumnId: string) => void,
) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData("text/plain", cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const cardId = draggedCardId || e.dataTransfer.getData("text/plain");

    if (cardId) {
      onDropCardToColumn(cardId, targetColumnId);
    }

    setDraggedCardId(null);
  };

  return {
    draggedCardId,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
