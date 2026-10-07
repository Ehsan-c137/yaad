"use client";

import { Paintbrush } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { COLOR_OPTIONS } from "../menu-constants";

interface MobileColorSectionProps {
  selectedColor?: string;
  onSelectColor: (colorName: string) => void;
}

export function MobileColorSection({
  selectedColor = "default",
  onSelectColor,
}: MobileColorSectionProps) {
  const { t } = useTranslation("editor");

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Paintbrush className="size-3.5" />
        <span>{t("backgroundColor")}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_OPTIONS.map((color) => {
          const isSelected =
            selectedColor.toLowerCase() === color.name.toLowerCase();

          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onSelectColor(color.name.toLowerCase())}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1.5 text-xs transition-all active:scale-95",
                color.bgClass,
                isSelected && "ring-2 ring-primary ring-offset-1",
              )}
            >
              <span
                className={cn(
                  "size-3 rounded-full border border-border",
                  color.bgClass,
                )}
              />
              <span className={color.textClass}>{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
