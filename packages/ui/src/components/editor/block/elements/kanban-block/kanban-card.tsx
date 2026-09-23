import { Input } from "@ui/input";
import { ArrowLeft, ArrowRight, Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { KanbanCardProps } from "./types";

import { useKanbanActions } from "./kanban-context";

export function KanbanCardItem({
  card,
  isFirstCol,
  isLastCol,
}: KanbanCardProps) {
  const { updateCardTitle, deleteCard, moveCard, handleDragStart } =
    useKanbanActions();

  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(card.title);

  const handleSave = () => {
    if (editingTitle.trim()) {
      updateCardTitle(card.id, editingTitle.trim());
      setIsEditing(false);
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingTitle(card.title);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditingTitle(card.title);
    setIsEditing(true);
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, card.id)}
      className="group/card relative flex cursor-grab flex-col rounded-md border border-border bg-background p-2.5 shadow-xs transition-all hover:border-border/80 hover:shadow-sm active:cursor-grabbing"
    >
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-emerald-500 hover:text-emerald-400"
            onClick={handleSave}
          >
            <Check className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={handleCancel}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <>
          <p
            onClick={handleStartEditing}
            className="cursor-pointer text-xs text-foreground leading-relaxed hover:text-primary transition-colors"
          >
            {card.title}
          </p>

          <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity group-hover/card:opacity-100">
            <div className="flex items-center gap-1">
              {!isFirstCol && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={() => moveCard(card.id, "left")}
                  title="Move left"
                >
                  <ArrowLeft className="size-3" />
                </Button>
              )}

              {!isLastCol && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={() => moveCard(card.id, "right")}
                  title="Move right"
                >
                  <ArrowRight className="size-3" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:text-foreground"
                onClick={handleStartEditing}
                title="Edit card"
              >
                <Edit2 className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:text-destructive"
                onClick={() => deleteCard(card.id)}
                title="Delete card"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
