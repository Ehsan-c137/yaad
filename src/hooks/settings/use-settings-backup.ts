"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import type { ImportSanitizationResult } from "@/lib/storage/backup/types";

import { triggerDownloadJSON } from "@/lib/storage/backup/download";
import { exportUserData } from "@/lib/storage/backup/export-service";
import { sanitizeImportData } from "@/lib/storage/backup/import-sanitizer";
import { importUserData } from "@/lib/storage/backup/import-service";

export function useSettingsBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] =
    useState<ImportSanitizationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading("Packaging workspace data...", { id: "export-toast" });

      const payload = await exportUserData();
      triggerDownloadJSON(payload);

      toast.success("Workspace data exported successfully", {
        id: "export-toast",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export workspace data", { id: "export-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rawJson = JSON.parse(text);
        const result = sanitizeImportData(rawJson);

        if (!result.valid) {
          toast.error(result.error ?? "Invalid backup file");
          return;
        }

        setPendingImport(result);
      } catch (err) {
        console.error("Import parse error:", err);
        toast.error("Could not parse file. Please upload a valid JSON backup.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!pendingImport?.payload) return;

    try {
      setIsImporting(true);
      toast.loading("Restoring sanitized data...", { id: "import-toast" });

      await importUserData(pendingImport.payload);

      toast.success("Data imported and restored successfully!", {
        id: "import-toast",
      });
      setPendingImport(null);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data.", { id: "import-toast" });
    } finally {
      setIsImporting(false);
    }
  };

  const cancelImport = () => {
    setPendingImport(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return {
    isExporting,
    isImporting,
    pendingImport,
    fileInputRef,
    handleExport,
    handleFileChange,
    confirmImport,
    cancelImport,
    triggerFileSelect,
  };
}

export type UseSettingsBackupReturn = ReturnType<typeof useSettingsBackup>;
