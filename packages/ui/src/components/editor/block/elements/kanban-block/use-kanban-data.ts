import type { DocumentBlock } from "@yaad/core/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import type { KanbanCard, KanbanColumn } from "./types";

export function useKanbanData(block: DocumentBlock) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();

  const columns: KanbanColumn[] = block.properties?.columns || [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const cards: KanbanCard[] = block.properties?.cards || [];

  const saveProperties = (
    updatedCols: KanbanColumn[],
    updatedCards: KanbanCard[],
  ) => {
    void updateBlockProperties(block.id, pageId, {
      columns: updatedCols,
      cards: updatedCards,
    });
  };

  const addColumn = () => {
    const newColId = `col_${crypto.randomUUID()}`;
    const newColName = `Column ${columns.length + 1}`;
    const updatedCols = [...columns, { id: newColId, title: newColName }];
    saveProperties(updatedCols, cards);
  };

  const deleteColumn = (colId: string) => {
    if (columns.length <= 1) return;
    const updatedCols = columns.filter((c) => c.id !== colId);
    const updatedCards = cards.filter((c) => c.columnId !== colId);
    saveProperties(updatedCols, updatedCards);
  };

  const updateColumnTitle = (colId: string, title: string) => {
    if (!title.trim()) return;
    const updatedCols = columns.map((c) =>
      c.id === colId ? { ...c, title: title.trim() } : c,
    );
    saveProperties(updatedCols, cards);
  };

  const addCard = (columnId: string, title: string) => {
    if (!title.trim()) return;
    const newCard: KanbanCard = {
      id: `card_${crypto.randomUUID()}`,
      columnId,
      title: title.trim(),
    };
    saveProperties(columns, [...cards, newCard]);
  };

  const deleteCard = (cardId: string) => {
    saveProperties(
      columns,
      cards.filter((c) => c.id !== cardId),
    );
  };

  const updateCardTitle = (cardId: string, title: string) => {
    if (!title.trim()) return;
    saveProperties(
      columns,
      cards.map((c) => (c.id === cardId ? { ...c, title: title.trim() } : c)),
    );
  };

  const moveCard = (cardId: string, direction: "left" | "right") => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const colIndex = columns.findIndex((col) => col.id === card.columnId);
    if (colIndex === -1) return;

    const targetIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const targetCol = columns[targetIndex];
    saveProperties(
      columns,
      cards.map((c) =>
        c.id === cardId ? { ...c, columnId: targetCol.id } : c,
      ),
    );
  };

  const reorderCardColumn = (cardId: string, targetColumnId: string) => {
    saveProperties(
      columns,
      cards.map((c) =>
        c.id === cardId ? { ...c, columnId: targetColumnId } : c,
      ),
    );
  };

  return {
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
  };
}
