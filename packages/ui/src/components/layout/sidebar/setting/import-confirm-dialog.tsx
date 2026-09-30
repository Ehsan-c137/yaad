"use client";

import type { ImportSanitizationResult } from "@yaad/core/lib/storage/backup/types";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@ui/dialog";
import { Info, ShieldCheck } from "lucide-react";

import { useTranslation } from "react-i18next";

export interface ImportConfirmDialogProps {
  pendingImport: ImportSanitizationResult | null;
  isImporting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmDialog({
  pendingImport,
  isImporting,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) {
  const { t } = useTranslation(["settings", "common"]);

  if (!pendingImport) return null;

  return (
    <Dialog open={!!pendingImport} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md gap-4 p-6">
        <DialogHeader className="gap-1.5 text-start">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ShieldCheck className="size-5 text-emerald-500" />
            {t("settings:confirmDataImport")}
          </div>
          <DialogDescription className="text-xs/relaxed text-muted-foreground">
            {t("settings:importParsedSuccess")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">
              {t("settings:workspacesLabel")}
            </span>
            <span className="font-medium">
              {pendingImport.stats.workspaceCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">
              {t("settings:documentsLabel")}
            </span>
            <span className="font-medium">
              {pendingImport.stats.documentCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">
              {t("settings:mediaBlobsLabel")}
            </span>
            <span className="font-medium">{pendingImport.stats.blobCount}</span>
          </div>
          {pendingImport.stats.sanitizedStringCount > 0 && (
            <div className="flex items-center gap-1.5 border-t border-border/40 pt-2 font-medium text-amber-500">
              <Info className="size-3.5 shrink-0" />
              {t("settings:sanitizedWarning", {
                count: pendingImport.stats.sanitizedStringCount,
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isImporting}
          >
            {t("common:cancel")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={isImporting}
          >
            {isImporting ? t("settings:importing") : t("settings:confirmImport")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
