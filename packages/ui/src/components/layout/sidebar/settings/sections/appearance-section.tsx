"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { ToggleThemeButton } from "@ui/toggle-theme-button";
import { Moon, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TransitionPreference } from "@/hooks/use-page-transition-preference";

import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AppearanceSection() {
  const { t } = useTranslation("settings");
  const { isLowDevice, preference, setPreference } =
    usePageTransitionPreference();

  const transitionOptions: readonly {
    label: string;
    value: TransitionPreference;
  }[] = [
    { label: t("transitionAuto"), value: "auto" },
    { label: t("transitionEnabled"), value: "enabled" },
    { label: t("transitionDisabled"), value: "disabled" },
  ];

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

      <SettingsRow
        icon={<Sparkles className="size-3.5" strokeWidth={1.5} />}
        title={t("pageTransitions")}
        subtitle={
          isLowDevice && preference === "auto"
            ? t("pageTransitionsLowDevice")
            : t("pageTransitionsSubtitle")
        }
        control={
          <Select
            value={preference}
            onValueChange={(val) => {
              if (val) {
                setPreference(val);
              }
            }}
            items={transitionOptions}
          >
            <SelectTrigger
              size="sm"
              aria-label={t("pageTransitions")}
              className="min-w-36 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              {transitionOptions.map((opt) => (
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
