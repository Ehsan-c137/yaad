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

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import type { AuthMode, AuthModalProps, AuthViewConfig } from "./types";

/**
 * Open/Closed Principle (OCP):
 * New auth views (e.g. forgot-password, sso) can be registered here
 * without modifying the modal container shell.
 */
const AUTH_VIEWS: Record<AuthMode, AuthViewConfig> = {
  login: {
    title: "Welcome back",
    description: "Sign in to your Yaad account to collaborate and sync",
    component: LoginForm,
  },
  register: {
    title: "Create an account",
    description: "Sign up to enable real-time collaboration across devices",
    component: RegisterForm,
  },
};

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "login",
  authService,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const currentView = AUTH_VIEWS[mode] ?? AUTH_VIEWS.login;
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
            Sign In
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
            Create Account
          </button>
        </div>

        {/* Active Form Component (LSP & DIP) */}
        <ActiveFormComponent
          onSuccess={() => onOpenChange(false)}
          onSwitchMode={setMode}
          authService={authService}
        />
      </DialogContent>
    </Dialog>
  );
}

export * from "./types";
export * from "./validation";
export { LoginForm } from "./login-form";
export { RegisterForm } from "./register-form";
