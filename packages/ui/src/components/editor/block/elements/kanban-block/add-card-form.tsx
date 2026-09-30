import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AddCardFormProps } from "./types";

import { useKanbanActions } from "./kanban-context";

export function AddCardForm({ columnId, colStyles }: AddCardFormProps) {
  const { t } = useTranslation(["editor", "common"]);
  const { addCard } = useKanbanActions();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      addCard(columnId, title.trim());
      setTitle("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <input
          type="text"
          autoFocus
          placeholder={t("editor:kanbanCardPlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") handleCancel();
          }}
          className="w-full bg-transparent px-2.5 py-1.5 text-xs text-foreground"
        />
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-xs px-3" onClick={handleSubmit}>
            {t("editor:kanbanAddCardButton")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={handleCancel}
          >
            {t("common:cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(true)}
      className={cn(
        "mt-3 h-8 w-full justify-start gap-1.5 text-xs transition-colors",
        colStyles.addCardBtn,
      )}
    >
      <Plus className="size-3.5" />
      {t("editor:kanbanAddCard")}
    </Button>
  );
}
