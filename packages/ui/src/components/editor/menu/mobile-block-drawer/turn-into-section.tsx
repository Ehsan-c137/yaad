"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Repeat } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { TURN_INTO_OPTIONS } from "../menu-constants";

interface MobileTurnIntoSectionProps {
  currentType: DocumentBlock["type"];
  onSelectType: (type: (typeof TURN_INTO_OPTIONS)[number]["type"]) => void;
}

export function MobileTurnIntoSection({
  currentType,
  onSelectType,
}: MobileTurnIntoSectionProps) {
  const { t } = useTranslation("editor");

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Repeat className="size-3.5" />
        <span>{t("turnInto")}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {TURN_INTO_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = currentType === item.type;

          return (
            <Button
              key={item.type}
              variant={isSelected ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSelectType(item.type)}
              className={cn(
                "justify-start gap-2 h-9 px-2.5 text-xs border border-transparent",
                isSelected &&
                  "border-primary/20 bg-primary/10 font-semibold text-primary",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
