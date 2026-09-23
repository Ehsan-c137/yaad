"use client";

import { Button } from "@ui/button";
import { styles } from "@yaad/core/lib/design-token";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { UserRound } from "lucide-react";
import { useState } from "react";

import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AccountSection() {
  const userName = useUserStore((state) => state.userName);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>Account</p>

      <SettingsRow
        icon={<UserRound className="size-3.5" strokeWidth={1.5} />}
        title={userName ?? "Add your name"}
        subtitle={
          userName
            ? "How your profile appears in Yaad"
            : "Personalize your workspace"
        }
        control={
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsEditOpen(true)}
            aria-label={userName ? "Edit your name" : "Add your name"}
          >
            {userName ? "Edit" : "Add"}
          </Button>
        }
      />

      <WelcomeModal open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
