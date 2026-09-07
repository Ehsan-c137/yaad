import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatRelativeTime } from "../date-formatter";

// 2024-06-04T12:00:00Z
const TIMESTAMP = Date.UTC(2024, 5, 4, 12, 0, 0);

describe("formatDate (Unit Test)", () => {
  it("formats a timestamp with the default day + short month options", () => {
    const result = formatDate(TIMESTAMP, { timeZone: "UTC", locale: "en-US" });

    expect(result).toBe("Jun 4");
  });

  it("accepts extra Intl options like year", () => {
    const result = formatDate(TIMESTAMP, {
      locale: "en-US",
      timeZone: "UTC",
      year: "numeric",
    });

    expect(result).toBe("Jun 4, 2024");
  });

  it("formats with a custom locale", () => {
    const result = formatDate(TIMESTAMP, {
      locale: "de-DE",
      timeZone: "UTC",
      year: "numeric",
    });

    expect(result).toBe("4. Juni 2024");
  });

  it("returns the fallback for invalid timestamps", () => {
    expect(formatDate(Number.NaN, { invalidDateFallback: "—" })).toBe("—");
    expect(formatDate(Number.NaN)).toBe("");
  });
});

describe("formatRelativeTime (Unit Test)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-04T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says 'just now' for less than a minute", () => {
    expect(formatRelativeTime(Date.now() - 30 * 1000)).toBe("just now");
    expect(formatRelativeTime(Date.now())).toBe("just now");
  });

  it("formats minutes ago", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe("5m ago");
  });

  it("formats hours ago", () => {
    expect(formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe("3h ago");
  });

  it("formats days ago below a week", () => {
    expect(formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe(
      "2d ago",
    );
  });

  it("falls back to an absolute date a week or more in the past", () => {
    const result = formatRelativeTime(Date.now() - 10 * 24 * 60 * 60 * 1000);

    expect(result).not.toMatch(/ago|just now/);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
