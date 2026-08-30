"use client";

import { ToggleThemeButton } from "@ui/toggle-theme-button";
import { Moon } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AppearanceSection() {
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>Appearance</p>

      <SettingsRow
        icon={<Moon className="size-3.5" strokeWidth={1.5} />}
        title="Dark Mode"
        subtitle="Switch between light and dark appearance"
        control={<ToggleThemeButton />}
      />
    </>
  );
}
