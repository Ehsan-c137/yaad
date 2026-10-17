"use client";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { authService as defaultAuthService } from "@yaad/core/services/auth-service";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthFormProps } from "./types";

import { validateLoginInput } from "./validation";

export function LoginForm({
  onSuccess,
  onSwitchMode,
  authService = defaultAuthService,
}: AuthFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateLoginInput(email, password);

    if (!validation.isValid) {
      setError(validation.error || "Please check your inputs.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(
        err.message || "Failed to log in. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("email")}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ps-10 text-xs"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("password")}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ps-10 pe-10 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl py-2 text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            t("signIn")
          )}
        </Button>
      </form>

      <div className="border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
        {t("dontHaveAccount")}{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("register")}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t("signUp")}
        </button>
      </div>
    </div>
  );
}
