"use client";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@ui/dialog";
import { Info, ShieldCheck } from "lucide-react";

import type { ImportSanitizationResult } from "@/lib/storage/backup/types";

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
  if (!pendingImport) return null;

  return (
    <Dialog open={!!pendingImport} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md gap-4 p-6">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ShieldCheck className="size-5 text-emerald-500" />
            Confirm Data Import
          </div>
          <DialogDescription className="text-xs/relaxed text-muted-foreground">
            Backup file parsed and sanitized successfully. Review the items that
            will be restored to your local storage:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">Workspaces:</span>
            <span className="font-medium">
              {pendingImport.stats.workspaceCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">Documents / Pages:</span>
            <span className="font-medium">
              {pendingImport.stats.documentCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="text-muted-foreground">
              Media & Attachment Blobs:
            </span>
            <span className="font-medium">{pendingImport.stats.blobCount}</span>
          </div>
          {pendingImport.stats.sanitizedStringCount > 0 && (
            <div className="flex items-center gap-1.5 border-t border-border/40 pt-2 font-medium text-amber-500">
              <Info className="size-3.5 shrink-0" />
              Sanitized {pendingImport.stats.sanitizedStringCount} potentially
              unsafe tag(s)/script(s) for security.
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
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Confirm & Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
