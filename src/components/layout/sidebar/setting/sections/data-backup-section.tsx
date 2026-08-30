"use client";

import type { ChangeEvent, RefObject } from "react";

import { Button } from "@ui/button";
import { Download, Upload } from "lucide-react";

import { styles } from "@/lib/design-token";
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
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>Data & Backup</p>

      <SettingsRow
        icon={<Download className="size-3.5" strokeWidth={1.5} />}
        title="Export Data"
        subtitle="Download backup JSON of workspaces & docs"
        control={
          <Button
            variant="outline"
            size="xs"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        }
      />

      <SettingsRow
        icon={<Upload className="size-3.5" strokeWidth={1.5} />}
        title="Import Data"
        subtitle="Restore data from a sanitized backup file"
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
              Import
            </Button>
          </>
        }
      />
    </>
  );
}
