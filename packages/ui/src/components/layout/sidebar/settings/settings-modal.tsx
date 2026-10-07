/* eslint-disable @typescript-eslint/strict-void-return */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSettingsBackup } from "@/hooks/settings/use-settings-backup";

import { ImportConfirmDialog } from "./import-confirm-dialog";
import { SectionDivider } from "./section-divider";
import { AboutSection } from "./sections/about-section";
import { AccountSection } from "./sections/account-section";
import { AppearanceSection } from "./sections/appearance-section";
import { DataBackupSection } from "./sections/data-backup-section";
import { KeyboardSection } from "./sections/keyboard-section";
import { LanguageSection } from "./sections/language-section";

interface SettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { t } = useTranslation("settings");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

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
      <Dialog
        open={isControlled ? open : uncontrolledOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          id="settings-modal"
          className="max-w-sm max-h-[90%] gap-0 overflow-y-auto p-0"
          aria-labelledby="settings-modal-title"
        >
          <DialogHeader className="flex items-center border-b border-border/50 px-5 pt-5 pb-4">
            <DialogTitle
              id="settings-modal-title"
              className="w-full text-center text-sm font-semibold tracking-tight"
            >
              {t("title")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col py-2">
            <AccountSection />

            <SectionDivider />

            <AppearanceSection />

            <SectionDivider />

            <LanguageSection />

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
