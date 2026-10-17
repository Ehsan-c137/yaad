"use client";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { authService as defaultAuthService } from "@yaad/core/services/auth-service";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthFormProps } from "./types";

import { validateRegisterInput } from "./validation";

export function RegisterForm({
  onSuccess,
  onSwitchMode,
  authService = defaultAuthService,
}: AuthFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateRegisterInput(email, password, confirmPassword);

    if (!validation.isValid) {
      setError(validation.error || "Please check your inputs.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(
        email.trim(),
        password,
        name.trim() || undefined,
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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
            htmlFor="register-name"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("yourNameOptional")}
          </label>
          <div className="relative flex items-center">
            <User className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ps-10 text-xs"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("email")}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-email"
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
            htmlFor="register-password"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("password")}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
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

        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1 block text-xs font-medium text-foreground"
          >
            {t("confirmPassword")}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute start-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ps-10 text-xs"
            />
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
              {t("creatingAccount")}
            </>
          ) : (
            t("createAccount")
          )}
        </Button>
      </form>

      <div className="border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("login")}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t("signIn")}
        </button>
      </div>
    </div>
  );
}
