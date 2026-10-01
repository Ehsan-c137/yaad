"use client";

import type { ChangeEvent, RefObject } from "react";

import { Button } from "@ui/button";
import { styles } from "@yaad/core/lib/design-token";
import { Download, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export interface DataBackupSectionProps {
  isExporting: boolean;
  isImporting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTriggerFileSelect: () => void;
}

export function DataBackupSection({
  isExporting,
  isImporting,
  fileInputRef,
  onExport,
  onFileChange,
  onTriggerFileSelect,
}: DataBackupSectionProps) {
  const { t } = useTranslation("settings");

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("dataBackup")}
      </p>

      <SettingsRow
        icon={<Download className="size-3.5" strokeWidth={1.5} />}
        title={t("exportData")}
        subtitle={t("exportDataSubtitle")}
        control={
          <Button
            variant="outline"
            size="xs"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? t("exporting") : t("export")}
          </Button>
        }
      />

      <SettingsRow
        icon={<Upload className="size-3.5" strokeWidth={1.5} />}
        title={t("importData")}
        subtitle={t("importDataSubtitle")}
        control={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              variant="outline"
              size="xs"
              onClick={onTriggerFileSelect}
              disabled={isImporting}
            >
              {isImporting ? t("importing") : t("import")}
            </Button>
          </>
        }
      />
    </>
  );
}
