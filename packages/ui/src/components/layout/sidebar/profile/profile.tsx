import { Avatar, AvatarFallback } from "@ui/avatar";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { authService } from "@yaad/core/services/auth-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { LogIn, LogOut, Pencil, Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { cn } from "@/lib/utils";

import { SettingsModal } from "../settings/settings-modal";

export function Profile({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation("sidebar");
  const userName = useUserStore((state) => state.userName);
  const email = useUserStore((state) => state.email);
  const token = useUserStore((state) => state.token);
  const userColor = useUserStore((state) => state.userColor);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const isLoggedIn = Boolean(token);
  const displayName = userName
    ? t("possessiveYaad", { name: userName })
    : isLoggedIn
      ? email ?? "Account"
      : t("myYaad");
  const initial = (userName?.trim().charAt(0) ?? email?.trim().charAt(0) ?? "Y").toUpperCase();

  const handleLogout = () => {
    setIsMenuOpen(false);
    authService.logout();
  };

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
          <Avatar className="size-7" style={{ backgroundColor: isLoggedIn ? `${userColor}20` : undefined }}>
            <AvatarFallback style={{ color: isLoggedIn ? userColor : undefined }}>{initial}</AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="flex flex-col items-start truncate text-left">
              <span className="truncate text-sm font-medium">{displayName}</span>
              {isLoggedIn && email && (
                <span className="truncate text-[10px] text-muted-foreground">{email}</span>
              )}
            </div>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="top"
          className="flex min-w-[200px] flex-col gap-1 p-1"
        >
          {isLoggedIn ? (
            <>
              <div className="px-2 py-1.5 border-b border-border/50">
                <p className="text-xs font-semibold text-foreground truncate">{userName || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{email}</p>
              </div>

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditNameOpen(true);
                }}
              >
                <Pencil strokeWidth={1.5} className="size-3.5" />
                {t("editName")}
              </Button>

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
              >
                <Settings strokeWidth={1.5} className="size-3.5" />
                {t("settings")}
              </Button>

              <div className="my-1 border-t border-border/50" />

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut strokeWidth={1.5} className="size-3.5" />
                {t("sidebar:logOut")}
              </Button>
            </>
          ) : (
            <>
              <div className="px-2 py-1.5 border-b border-border/50">
                <p className="text-xs font-semibold text-foreground">{t("sidebar:guestMode")}</p>
                <p className="text-[11px] text-muted-foreground">{t("sidebar:guestModeDesc")}</p>
              </div>

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }}
              >
                <LogIn strokeWidth={1.5} className="size-3.5" />
                {t("sidebar:signIn")}
              </Button>

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs"
                onClick={() => {
                  setIsMenuOpen(false);
                  setAuthMode("register");
                  setIsAuthOpen(true);
                }}
              >
                <UserPlus strokeWidth={1.5} className="size-3.5" />
                {t("sidebar:createAccount")}
              </Button>

              <div className="my-1 border-t border-border/50" />

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditNameOpen(true);
                }}
              >
                <Pencil strokeWidth={1.5} className="size-3.5" />
                {t("editName")}
              </Button>

              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-xs"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
              >
                <Settings strokeWidth={1.5} className="size-3.5" />
                {t("settings")}
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <WelcomeModal open={isEditNameOpen} onOpenChange={setIsEditNameOpen} />
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} initialMode={authMode} />
    </>
  );
}
