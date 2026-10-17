import { describe, expect, it } from "vitest";

import {
  validateEmail,
  validateLoginInput,
  validatePassword,
  validateRegisterInput,
} from "../validation";

describe("Auth Validation (SRP)", () => {
  describe("validateEmail", () => {
    it("fails on empty or whitespace email", () => {
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("   ").isValid).toBe(false);
    });

    it("fails on invalid email patterns", () => {
      expect(validateEmail("invalid-email").isValid).toBe(false);
      expect(validateEmail("user@").isValid).toBe(false);
      expect(validateEmail("@example.com").isValid).toBe(false);
    });

    it("succeeds on valid email format", () => {
      expect(validateEmail("user@example.com").isValid).toBe(true);
      expect(validateEmail("  test.user@domain.co  ").isValid).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("fails on empty password", () => {
      expect(validatePassword("").isValid).toBe(false);
    });

    it("fails when shorter than minimum length", () => {
      const res = validatePassword("12345", 6);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("at least 6 characters");
    });

    it("succeeds when length meets minimum requirement", () => {
      expect(validatePassword("123456", 6).isValid).toBe(true);
      expect(validatePassword("super-secret-password", 6).isValid).toBe(true);
    });
  });

  describe("validateLoginInput", () => {
    it("validates both email and password presence", () => {
      expect(validateLoginInput("", "secret").isValid).toBe(false);
      expect(validateLoginInput("user@example.com", "").isValid).toBe(false);
      expect(validateLoginInput("user@example.com", "secret").isValid).toBe(
        true,
      );
    });
  });

  describe("validateRegisterInput", () => {
    it("fails when password and confirmPassword mismatch", () => {
      const res = validateRegisterInput(
        "user@example.com",
        "pass123",
        "pass456",
      );
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Passwords do not match.");
    });

    it("succeeds when all fields are valid and passwords match", () => {
      const res = validateRegisterInput(
        "user@example.com",
        "pass123",
        "pass123",
      );
      expect(res.isValid).toBe(true);
    });
  });
});
