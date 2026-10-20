/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from "@ui/button";
import { Separator } from "@ui/separator";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

interface ImportExportTabProps {
  onSuccess?: () => void;
}

export const ImportExportTab: React.FC<ImportExportTabProps> = ({
  onSuccess,
}) => {
  const categories = useCalendarStore((s) => s.categories);
  const importICS = useCalendarStore((s) => s.importICS);
  const exportICS = useCalendarStore((s) => s.exportICS);

  const [importTargetCat, setImportTargetCat] = useState("work");
  const [importStatusMsg, setImportStatusMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = importICS(text, importTargetCat);
        setImportStatusMsg({
          type: "success",
          text: `Imported ${result.added} events into your calendar successfully!`,
        });
        setTimeout(() => {
          onSuccess?.();
        }, 1200);
      } catch (err: unknown) {
        setImportStatusMsg({
          type: "error",
          text:
            err instanceof Error ? err.message : "Failed to parse .ics file.",
        });
      }
    };

    reader.readAsText(file);
  };

  const handleExport = (calendarId?: string) => {
    try {
      const ics = exportICS(calendarId);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yaad-calendar-${calendarId || "all"}-${new Date().toISOString().slice(0, 10)}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setImportStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to export calendar.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Import Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-foreground">
            Import .ics (iCalendar) File
          </span>
          <span className="text-xs text-muted-foreground">
            Upload an exported .ics file from Google, Apple, or Outlook to bring
            events into Yaad.
          </span>
        </div>
        <label className="text-[12px] font-medium text-foreground flex flex-col gap-1.5">
          Import Into Category
          <select
            value={importTargetCat}
            onChange={(e) => setImportTargetCat(e.target.value)}
            className="h-8 rounded-2xl border border-border/40 bg-input/70 px-3 py-1 text-xs text-foreground outline-none transition-[color,box-shadow,background-color,border-color] duration-(--press-duration) ease-(--spring) hover:border-border/60 hover:bg-input/80 focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/20 dark:bg-input/30"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {/* Drag/Click file dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics,text/calendar"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
            <Upload className="size-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Click or drag & drop .ics file
          </span>
          <span className="text-xs text-muted-foreground">
            Supports RFC 5545 iCalendar standard formatted files
          </span>
        </div>
        {importStatusMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              importStatusMsg.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {importStatusMsg.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{importStatusMsg.text}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* 2. Export Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-foreground">
            Export Your Calendars
          </span>
          <span className="text-xs text-muted-foreground">
            Download your local events and schedules as standard .ics files
            compatible with all devices.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExport()}
            className="gap-2 text-xs font-semibold"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export All Calendars</span>
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport(cat.id)}
              className="gap-1.5 text-xs font-medium"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: cat.dotColor }}
              />
              <span>Export {cat.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
