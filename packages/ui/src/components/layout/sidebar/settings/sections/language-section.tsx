/* eslint-disable perfectionist/sort-imports */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { styles } from "@/lib/design-token";
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
          <Select
            value={currentLanguage}
            onValueChange={(val) => {
              if (val) {
                void i18n.changeLanguage(val);
              }
            }}
            items={LANGUAGE_OPTIONS}
          >
            <SelectTrigger
              size="sm"
              aria-label={t("languageLabel")}
              className="min-w-28 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
