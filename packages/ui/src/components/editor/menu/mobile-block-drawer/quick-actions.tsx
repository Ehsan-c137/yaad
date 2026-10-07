"use client";

import { Button } from "@ui/button";
import { Copy, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileQuickActionsProps {
  onDuplicate: () => void;
  onDelete: () => void;
}

export function MobileQuickActions({
  onDuplicate,
  onDelete,
}: MobileQuickActionsProps) {
  const { t } = useTranslation(["editor", "common"]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onDuplicate}
        className="justify-start gap-2 h-9 text-xs"
      >
        <Copy className="size-3.5 text-muted-foreground" />
        <span>{t("editor:duplicate")}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="justify-start gap-2 h-9 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      >
        <Trash2 className="size-3.5 text-destructive" />
        <span>{t("editor:deleteBlock")}</span>
      </Button>
    </div>
  );
}
