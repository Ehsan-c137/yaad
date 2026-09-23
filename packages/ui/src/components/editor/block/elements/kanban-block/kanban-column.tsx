import { Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { KanbanColumnProps } from "./types";

import { AddCardForm } from "./add-card-form";
import { KanbanCardItem } from "./kanban-card";
import { useKanbanActions } from "./kanban-context";
import { getColumnStyles } from "./kanban-styles";

export function KanbanColumnItem({
  column,
  cards,
  isFirstCol,
  isLastCol,
  totalColumns,
}: KanbanColumnProps) {
  const { updateColumnTitle, deleteColumn, handleDragOver, handleDrop } =
    useKanbanActions();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(column.title);

  const colCards = cards.filter((c) => c.columnId === column.id);
  const colStyles = getColumnStyles(column);

  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      updateColumnTitle(column.id, editingTitle.trim());
      setIsEditingTitle(false);
    } else {
      handleCancelTitle();
    }
  };

  const handleCancelTitle = () => {
    setEditingTitle(column.title);
    setIsEditingTitle(false);
  };

  const handleStartEditingTitle = () => {
    setEditingTitle(column.title);
    setIsEditingTitle(true);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, column.id)}
      className={cn(
        "flex w-72 flex-shrink-0 flex-col rounded-lg border p-3 transition-colors",
        colStyles.container,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex items-center gap-1">
            <span
              className={cn("size-2 rounded-full animate-pulse", colStyles.dot)}
            />
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelTitle();
              }}
              className="w-40 bg-transparent px-2 text-xs text-medium text-foreground outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-emerald-500 hover:text-emerald-400"
              onClick={handleSaveTitle}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground"
              onClick={handleCancelTitle}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", colStyles.dot)} />
            <h3
              onClick={handleStartEditingTitle}
              className={cn(
                "cursor-pointer text-xs hover:opacity-80 transition-opacity",
                colStyles.headerText,
              )}
              title="Click to rename"
            >
              {column.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                colStyles.badge,
              )}
            >
              {colCards.length}
            </span>
          </div>
        )}

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={handleStartEditingTitle}
            title="Rename column"
          >
            <Edit2 className="size-3" />
          </Button>

          {totalColumns > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              onClick={() => deleteColumn(column.id)}
              title="Delete column"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex min-h-[60px] flex-col gap-2">
        {colCards.map((card) => (
          <KanbanCardItem
            key={card.id}
            card={card}
            isFirstCol={isFirstCol}
            isLastCol={isLastCol}
          />
        ))}
      </div>

      <AddCardForm columnId={column.id} colStyles={colStyles} />
    </div>
  );
}
