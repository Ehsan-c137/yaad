import { Avatar, AvatarFallback } from "@ui/avatar";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { Pencil, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { cn } from "@/lib/utils";

import { SettingsModal } from "../settings/settings-modal";

export function Profile({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation("sidebar");
  const userName = useUserStore((state) => state.userName);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const displayName = userName
    ? t("possessiveYaad", { name: userName })
    : t("myYaad");
  const initial = (userName?.trim().charAt(0) ?? "Y").toUpperCase();

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className={cn(
                "rounded-full transition-transform active:scale-95",
                compact
                  ? "size-8 justify-center p-0"
                  : "size-auto w-full flex-1 justify-start gap-2 p-2",
              )}
              aria-label={t("openProfileMenu")}
              title={compact ? displayName : undefined}
            />
          }
        >
          <Avatar className="size-7">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="truncate text-sm font-medium">{displayName}</span>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="top"
          className="flex flex-col gap-1 p-1"
        >
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditNameOpen(true);
            }}
          >
            <Pencil strokeWidth={1.5} className="size-4" />
            {t("editName")}
          </Button>

          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSettingsOpen(true);
            }}
          >
            <Settings strokeWidth={1.5} className="size-4" />
            {t("settings")}
          </Button>
        </PopoverContent>
      </Popover>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <WelcomeModal open={isEditNameOpen} onOpenChange={setIsEditNameOpen} />
    </>
  );
}
