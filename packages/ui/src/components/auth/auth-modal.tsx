"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthModalProps, AuthMode, AuthViewConfig } from "./types";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "login",
  authService,
}: AuthModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const viewConfig: Record<AuthMode, AuthViewConfig> = {
    login: {
      title: t("welcomeBack"),
      description: t("welcomeBackDesc"),
      component: LoginForm,
    },
    register: {
      title: t("createAccount"),
      description: t("createAccountDesc"),
      component: RegisterForm,
    },
  };

  const currentView = viewConfig[mode] ?? viewConfig.login;
  const ActiveFormComponent = currentView.component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-8">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {currentView.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {currentView.description}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Switcher Pill */}
        <div className="flex w-full items-center rounded-xl bg-muted/60 p-1 border border-border/40">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "login"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("signIn")}
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "register"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("createAccount")}
          </button>
        </div>

        <ActiveFormComponent
          onSuccess={() => onOpenChange(false)}
          onSwitchMode={setMode}
          authService={authService}
        />
      </DialogContent>
    </Dialog>
  );
}

export { LoginForm } from "./login-form";
export { RegisterForm } from "./register-form";
export type * from "./types";
export * from "./validation";
