"use client";

import { styles } from "@yaad/core/lib/design-token";
import { Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function KeyboardSection() {
  const { t } = useTranslation("settings");

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("keyboard")}
      </p>

      <SettingsRow
        icon={<Keyboard className="size-3.5" strokeWidth={1.5} />}
        title={t("quickOpen")}
        subtitle={t("quickOpenSubtitle")}
        control={
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <kbd className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5">
              âŒ˜K
            </kbd>
            <span className="opacity-60">/</span>
            <kbd className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5">
              Ctrl+K
            </kbd>
          </div>
        }
      />
    </>
  );
}
