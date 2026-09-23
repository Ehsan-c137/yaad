import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "../use-theme";

class FakeMutationObserver {
  static instances: FakeMutationObserver[] = [];
  callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
    FakeMutationObserver.instances.push(this);
  }

  observe(): void {}

  disconnect(): void {}

  trigger(): void {
    this.callback([], this as unknown as MutationObserver);
  }
}

function triggerLastObserver(): void {
  FakeMutationObserver.instances.at(-1)?.trigger();
}

describe("useTheme (Unit Test)", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    FakeMutationObserver.instances = [];
    vi.unstubAllGlobals();
  });

  it("reports false in light mode", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current).toBe(false);
  });

  it("reports true when the document starts in dark mode", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current).toBe(true);
  });

  it("tracks dark class changes after mount", () => {
    vi.stubGlobal("MutationObserver", FakeMutationObserver);
    const { result } = renderHook(() => useTheme());

    act(() => {
      document.documentElement.classList.add("dark");
      triggerLastObserver();
    });

    expect(result.current).toBe(true);

    act(() => {
      document.documentElement.classList.remove("dark");
      triggerLastObserver();
    });

    expect(result.current).toBe(false);
  });
});
