import { ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CoverTabProps } from "../cover-picker-types";

import { useCoverUpload } from "../use-cover-upload";

export function CoverUploadTab({ onSelectCover, onClose }: CoverTabProps) {
  const { t } = useTranslation("editor");

  const {
    isUploading,
    isDragging,
    uploadError,
    fileInputRef,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFileDialog,
  } = useCoverUpload({ onSuccess: onSelectCover, onClose });

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={t("dragAndDropCover")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFileDialog();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border/80 bg-muted/30 hover:bg-muted/60 hover:border-foreground/30",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-foreground">
              {t("uploading")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">
                {t("dragAndDropCover")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("uploadHelpText")}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              <ImageIcon className="size-3.5 me-1.5" />
              <span>{t("chooseFile")}</span>
            </Button>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-destructive text-center">{uploadError}</p>
      )}
    </div>
  );
}
