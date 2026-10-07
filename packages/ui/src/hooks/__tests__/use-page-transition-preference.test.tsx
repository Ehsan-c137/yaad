/* eslint-disable @typescript-eslint/no-misused-spread */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePageTransitionPreference } from "../use-page-transition-preference";

describe("usePageTransitionPreference", () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.lowDevice;
    delete document.documentElement.dataset.pageTransitions;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("defaults to auto and enables transitions on capable devices", () => {
    vi.stubGlobal("navigator", {
      ...originalNavigator,
      hardwareConcurrency: 8,
      deviceMemory: 16,
      connection: { saveData: false },
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => usePageTransitionPreference());

    expect(result.current.preference).toBe("auto");
    expect(result.current.isLowDevice).toBe(false);
    expect(result.current.transitionsEnabled).toBe(true);
    expect(document.documentElement.dataset.lowDevice).toBe("false");
    expect(document.documentElement.dataset.pageTransitions).toBe("enabled");
  });

  it("automatically disables transitions on lower-end devices in auto mode", () => {
    vi.stubGlobal("navigator", {
      ...originalNavigator,
      hardwareConcurrency: 2, // Low cores
      deviceMemory: 2, // Low memory
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => usePageTransitionPreference());

    expect(result.current.preference).toBe("auto");
    expect(result.current.isLowDevice).toBe(true);
    expect(result.current.transitionsEnabled).toBe(false);
    expect(document.documentElement.dataset.lowDevice).toBe("true");
    expect(document.documentElement.dataset.pageTransitions).toBe("disabled");
  });

  it("disables transitions when preference is set to disabled", () => {
    vi.stubGlobal("navigator", {
      ...originalNavigator,
      hardwareConcurrency: 16,
      deviceMemory: 32,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => usePageTransitionPreference());

    act(() => {
      result.current.setPreference("disabled");
    });

    expect(result.current.preference).toBe("disabled");
    expect(result.current.transitionsEnabled).toBe(false);
    expect(document.documentElement.dataset.pageTransitions).toBe("disabled");
  });

  it("forces enable transitions when preference is set to enabled", () => {
    vi.stubGlobal("navigator", {
      ...originalNavigator,
      hardwareConcurrency: 2, // Low hardware
      deviceMemory: 2,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => usePageTransitionPreference());

    expect(result.current.transitionsEnabled).toBe(false);

    act(() => {
      result.current.setPreference("enabled");
    });

    expect(result.current.preference).toBe("enabled");
    expect(result.current.transitionsEnabled).toBe(true);
    expect(document.documentElement.dataset.pageTransitions).toBe("enabled");
  });
});
