import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDevicePerformanceInfo,
  isLowEndDevice,
} from "../device-performance";

describe("device-performance utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockNavigator(props: {
    connection?: { effectiveType?: string; saveData?: boolean };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  }) {
    vi.stubGlobal("navigator", {
      connection: props.connection,
      deviceMemory: props.deviceMemory,
      hardwareConcurrency: props.hardwareConcurrency,
    });
  }

  it("detects high-end device when cores and memory are ample", () => {
    mockNavigator({
      connection: { effectiveType: "4g", saveData: false },
      deviceMemory: 16,
      hardwareConcurrency: 8,
    });

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          addEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          matches: false,
          media: query,
          onchange: null,
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const info = getDevicePerformanceInfo();

    expect(info.isLowEndDevice).toBe(false);
    expect(info.cores).toBe(8);
    expect(info.deviceMemory).toBe(16);
    expect(isLowEndDevice()).toBe(false);
  });

  it("flags as low-end when hardwareConcurrency <= 4", () => {
    mockNavigator({
      deviceMemory: 8,
      hardwareConcurrency: 4,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as unknown as MediaQueryList);

    expect(isLowEndDevice()).toBe(true);
  });

  it("flags as low-end when deviceMemory < 4", () => {
    mockNavigator({
      deviceMemory: 2,
      hardwareConcurrency: 8,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as unknown as MediaQueryList);

    expect(isLowEndDevice()).toBe(true);
  });

  it("flags as low-end when prefers-reduced-motion is active", () => {
    mockNavigator({
      deviceMemory: 32,
      hardwareConcurrency: 16,
    });

    vi.spyOn(window, "matchMedia").mockImplementation((query) => {
      if (query.includes("prefers-reduced-motion: reduce")) {
        return { matches: true } as unknown as MediaQueryList;
      }
      return { matches: false } as unknown as MediaQueryList;
    });

    const info = getDevicePerformanceInfo();

    expect(info.prefersReducedMotion).toBe(true);
    expect(info.isLowEndDevice).toBe(true);
  });

  it("flags as low-end when saveData is enabled", () => {
    mockNavigator({
      connection: { saveData: true },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as unknown as MediaQueryList);

    const info = getDevicePerformanceInfo();

    expect(info.saveData).toBe(true);
    expect(info.isLowEndDevice).toBe(true);
  });

  it("flags as low-end on slow network connection", () => {
    mockNavigator({
      connection: { effectiveType: "2g", saveData: false },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as unknown as MediaQueryList);

    expect(isLowEndDevice()).toBe(true);
  });
});
