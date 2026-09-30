"use client";

import { styles } from "@yaad/core/lib/design-token";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
] as const;

export function LanguageSection() {
  const { t, i18n } = useTranslation("settings");
  const currentLanguage = i18n.resolvedLanguage?.startsWith("fa") ? "fa" : "en";

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("language")}
      </p>

      <SettingsRow
        icon={<Globe className="size-3.5" strokeWidth={1.5} />}
        title={t("languageLabel")}
        subtitle={t("languageSubtitle")}
        control={
          <select
            value={currentLanguage}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            aria-label={t("languageLabel")}
            className={cn(
              "h-7 cursor-pointer rounded-lg border border-border/60 bg-muted/30 px-2 text-xs text-foreground",
              "transition-colors focus:border-(--accent-blue) focus:outline-none focus:ring-1 focus:ring-(--accent-blue)",
            )}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        }
      />
    </>
  );
}
