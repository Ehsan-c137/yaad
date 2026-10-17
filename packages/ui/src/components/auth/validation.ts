import type { ValidationResult } from "./types";

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { isValid: false, error: "Please enter your email address." };
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

export function validatePassword(
  password: string,
  minLength = 6,
): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Please enter your password." };
  }
  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long.`,
    };
  }

  return { isValid: true };
}

export function validateLoginInput(
  email: string,
  password: string,
): ValidationResult {
  const emailRes = validateEmail(email);
  if (!emailRes.isValid) return emailRes;

  if (!password) {
    return { isValid: false, error: "Please enter your password." };
  }

  return { isValid: true };
}

export function validateRegisterInput(
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult {
  const emailRes = validateEmail(email);
  if (!emailRes.isValid) return emailRes;

  const passwordRes = validatePassword(password);
  if (!passwordRes.isValid) return passwordRes;

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true };
}
