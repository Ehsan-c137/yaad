"use client";

import { Button } from "@ui/button";
import { styles } from "@yaad/core/lib/design-token";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AccountSection() {
  const { t } = useTranslation(["settings", "common"]);
  const userName = useUserStore((state) => state.userName);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("settings:account")}
      </p>

      <SettingsRow
        icon={<UserRound className="size-3.5" strokeWidth={1.5} />}
        title={userName ?? t("settings:addYourName")}
        subtitle={
          userName
            ? t("settings:profileAppears")
            : t("settings:personalizeWorkspace")
        }
        control={
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsEditOpen(true)}
            aria-label={
              userName
                ? t("settings:editYourName")
                : t("settings:addYourName")
            }
          >
            {userName ? t("common:edit") : t("common:add")}
          </Button>
        }
      />

      <WelcomeModal open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
