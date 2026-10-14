import type { IAuthService } from "@yaad/core/services/auth-service";
import type React from "react";

export type AuthMode = "login" | "register";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AuthFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  authService?: IAuthService;
}

export interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
  authService?: IAuthService;
}

export interface AuthViewConfig {
  title: string;
  description: string;
  component: React.ComponentType<AuthFormProps>;
}
