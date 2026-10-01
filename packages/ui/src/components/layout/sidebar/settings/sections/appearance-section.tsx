"use client";

import { ToggleThemeButton } from "@ui/toggle-theme-button";
import { styles } from "@yaad/core/lib/design-token";
import { Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AppearanceSection() {
  const { t } = useTranslation("settings");

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("appearance")}
      </p>

      <SettingsRow
        icon={<Moon className="size-3.5" strokeWidth={1.5} />}
        title={t("darkMode")}
        subtitle={t("darkModeSubtitle")}
        control={<ToggleThemeButton />}
      />
    </>
  );
}
