import type { DocumentBlock } from "@yaad/core/types/document";

import { useState } from "react";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import type { KanbanCard, KanbanColumn } from "./types";

export function useKanbanBlock(block: DocumentBlock) {
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

  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColTitle, setEditingColTitle] = useState("");

  const [addingCardColId, setAddingCardColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardTitle, setEditingCardTitle] = useState("");

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const saveProperties = (
    updatedCols: KanbanColumn[],
    updatedCards: KanbanCard[],
  ) => {
    void updateBlockProperties(block.id, pageId, {
      columns: updatedCols,
      cards: updatedCards,
    });
  };

  // --- Column Handlers ---
  const handleAddColumn = () => {
    const newColId = `col_${crypto.randomUUID()}`;
    const newColName = `Column ${columns.length + 1}`;
    const updatedCols = [...columns, { id: newColId, title: newColName }];
    saveProperties(updatedCols, cards);
  };

  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) return;
    const updatedCols = columns.filter((c) => c.id !== colId);
    const updatedCards = cards.filter((c) => c.columnId !== colId);
    saveProperties(updatedCols, updatedCards);
  };

  const startEditColumn = (col: KanbanColumn) => {
    setEditingColId(col.id);
    setEditingColTitle(col.title);
  };

  const cancelEditColumn = () => {
    setEditingColId(null);
    setEditingColTitle("");
  };

  const saveEditColumn = (colId: string) => {
    if (!editingColTitle.trim()) {
      setEditingColId(null);
      return;
    }

    const updatedCols = columns.map((c) =>
      c.id === colId ? { ...c, title: editingColTitle.trim() } : c,
    );
    saveProperties(updatedCols, cards);
    setEditingColId(null);
  };

  // --- Card Handlers ---
  const startAddingCard = (columnId: string) => {
    setAddingCardColId(columnId);
    setNewCardTitle("");
  };

  const cancelAddingCard = () => {
    setAddingCardColId(null);
    setNewCardTitle("");
  };

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    const newCard: KanbanCard = {
      id: `card_${crypto.randomUUID()}`,
      columnId,
      title: newCardTitle.trim(),
    };
    const updatedCards = [...cards, newCard];
    saveProperties(columns, updatedCards);
    setNewCardTitle("");
    setAddingCardColId(null);
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = cards.filter((c) => c.id !== cardId);
    saveProperties(columns, updatedCards);
  };

  const startEditCard = (card: KanbanCard) => {
    setEditingCardId(card.id);
    setEditingCardTitle(card.title);
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditingCardTitle("");
  };

  const saveEditCard = (cardId: string) => {
    if (!editingCardTitle.trim()) {
      setEditingCardId(null);
      return;
    }

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, title: editingCardTitle.trim() } : c,
    );
    saveProperties(columns, updatedCards);
    setEditingCardId(null);
  };

  const moveCardColumn = (cardId: string, direction: "left" | "right") => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const colIndex = columns.findIndex((col) => col.id === card.columnId);
    if (colIndex === -1) return;

    const targetIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const targetCol = columns[targetIndex];
    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, columnId: targetCol.id } : c,
    );
    saveProperties(columns, updatedCards);
  };

  // --- Drag & Drop Handlers ---
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
    if (!cardId) return;

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, columnId: targetColumnId } : c,
    );
    saveProperties(columns, updatedCards);
    setDraggedCardId(null);
  };

  return {
    columns,
    cards,
    editingColId,
    editingColTitle,
    setEditingColTitle,
    addingCardColId,
    newCardTitle,
    setNewCardTitle,
    editingCardId,
    editingCardTitle,
    setEditingCardTitle,
    handleAddColumn,
    handleDeleteColumn,
    startEditColumn,
    cancelEditColumn,
    saveEditColumn,
    startAddingCard,
    cancelAddingCard,
    handleAddCard,
    handleDeleteCard,
    startEditCard,
    cancelEditCard,
    saveEditCard,
    moveCardColumn,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
