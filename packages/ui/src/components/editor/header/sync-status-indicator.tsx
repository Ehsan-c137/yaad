"use client";

import { AlertCircle, Check, CloudOff, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSyncStatus } from "@/hooks/editor/use-sync-status";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator() {
  const { t } = useTranslation("common");
  const { saveState, pendingCount, triggerSync } = useSyncStatus();

  if (saveState === "saved") {
    return (
      <div
        data-testid="sync-status-saved"
        className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-2.5 py-1 text-xs font-medium text-muted-foreground select-none transition-colors"
        title={t("allChangesSaved")}
      >
        <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check className="size-2.5 stroke-[2.5]" />
        </span>
        <span>{t("saved")}</span>
      </div>
    );
  }

  if (saveState === "syncing") {
    return (
      <div
        data-testid="sync-status-syncing"
        className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 select-none transition-colors"
        title={t("syncing")}
      >
        <RotateCw className="size-3.5 animate-spin" />
        <span>{t("syncing")}</span>
      </div>
    );
  }

  if (saveState === "offline") {
    const label =
      pendingCount > 0
        ? t("savedOfflineWithCount", { count: pendingCount })
        : t("savedOffline");

    return (
      <div
        data-testid="sync-status-offline"
        className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 select-none transition-colors"
        title={label}
      >
        <CloudOff className="size-3.5" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-testid="sync-status-error"
      onClick={triggerSync}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 select-none transition-colors",
      )}
      title={t("retrySync")}
    >
      <AlertCircle className="size-3.5" />
      <span>{t("syncError")}</span>
    </button>
  );
}
