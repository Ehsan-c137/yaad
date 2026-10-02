import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CoverTabProps } from "../cover-picker-types";

export function CoverLinkTab({ onSelectCover, onClose }: CoverTabProps) {
  const { t } = useTranslation("editor");
  const [customUrl, setCustomUrl] = useState("");

  const handleApplyCustomLink = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = customUrl.trim();
    if (!trimmed) return;

    try {
      const url = new URL(trimmed);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        toast.error(t("invalidFileType") || "Invalid image URL");
        return;
      }

      onSelectCover(trimmed);
      setCustomUrl("");
      onClose();
    } catch {
      toast.error(t("invalidFileType") || "Invalid image URL");
    }
  };

  return (
    <form onSubmit={handleApplyCustomLink} className="space-y-3">
      <Input
        type="url"
        value={customUrl}
        onChange={(e) => setCustomUrl(e.target.value)}
        placeholder={t("pasteImageLink")}
        autoFocus
      />

      {customUrl.trim() && (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-border">
          <img
            src={customUrl.trim()}
            alt="Preview"
            className="size-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={!customUrl.trim()}
        className="w-full text-xs font-medium"
      >
        {t("submit")}
      </Button>
    </form>
  );
}
