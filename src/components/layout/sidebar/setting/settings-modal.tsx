"use client";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Settings } from "lucide-react";

import { useSettingsBackup } from "@/hooks/settings/use-settings-backup";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { ImportConfirmDialog } from "./import-confirm-dialog";
import { SectionDivider } from "./section-divider";
import { AboutSection } from "./sections/about-section";
import { AppearanceSection } from "./sections/appearance-section";
import { DataBackupSection } from "./sections/data-backup-section";
import { KeyboardSection } from "./sections/keyboard-section";

export function SettingsModal() {
  const {
    isExporting,
    isImporting,
    pendingImport,
    fileInputRef,
    handleExport,
    handleFileChange,
    confirmImport,
    cancelImport,
    triggerFileSelect,
  } = useSettingsBackup();

  return (
    <>
      <Dialog>
        <DialogTrigger
          render={
            <Button
              onClick={(e) => e.stopPropagation()}
              id="sidebar-settings-trigger"
              variant="ghost"
              size="icon"
              aria-label="Open settings"
              className={cn(
                styles.listRow,
                "relative size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground",
                "after:absolute after:-inset-1.5 after:content-['']",
              )}
            />
          }
        >
          <Settings strokeWidth={1.5} className="size-4.5" />
        </DialogTrigger>

        <DialogContent
          id="settings-modal"
          className="max-w-sm gap-0 overflow-hidden p-0"
          aria-labelledby="settings-modal-title"
        >
          <DialogHeader className="flex items-center border-b border-border/50 px-5 pt-5 pb-4">
            <DialogTitle
              id="settings-modal-title"
              className="w-full text-center text-sm font-semibold tracking-tight"
            >
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col py-2">
            <AppearanceSection />

            <SectionDivider />

            <KeyboardSection />

            <SectionDivider />

            <DataBackupSection
              isExporting={isExporting}
              isImporting={isImporting}
              fileInputRef={fileInputRef}
              onExport={handleExport}
              onFileChange={handleFileChange}
              onTriggerFileSelect={triggerFileSelect}
            />

            <SectionDivider />

            <AboutSection />
          </div>

          {/* Footer spacer */}
          <div className="h-3" />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Data Import */}
      <ImportConfirmDialog
        pendingImport={pendingImport}
        isImporting={isImporting}
        onConfirm={confirmImport}
        onCancel={cancelImport}
      />
    </>
  );
}
