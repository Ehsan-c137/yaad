import { act, renderHook } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSidebarToggle } from "../use-sidebar-toggle";

describe("useSidebarToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({
      isSidebarOpen: true,
    });
    delete (document as unknown as { startViewTransition?: unknown })
      .startViewTransition;
  });

  it("toggles sidebar state directly when View Transition API is not supported", () => {
    const { result } = renderHook(() => useSidebarToggle());

    expect(useSidebarStore.getState().isSidebarOpen).toBe(true);

    act(() => {
      result.current();
    });

    expect(useSidebarStore.getState().isSidebarOpen).toBe(false);

    act(() => {
      result.current();
    });

    expect(useSidebarStore.getState().isSidebarOpen).toBe(true);
  });

  it("uses document.startViewTransition when supported and transitions are enabled", () => {
    const mockStartViewTransition = vi.fn(
      (callback: () => void) => {
        callback();
        return {
          finished: Promise.resolve(),
          ready: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: vi.fn(),
        };
      },
    );

    (
      document as unknown as {
        startViewTransition: typeof mockStartViewTransition;
      }
    ).startViewTransition = mockStartViewTransition;

    const { result } = renderHook(() => useSidebarToggle());

    act(() => {
      result.current();
    });

    expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
    expect(useSidebarStore.getState().isSidebarOpen).toBe(false);
  });

  it("does not use document.startViewTransition when preference is disabled", () => {
    localStorage.setItem("page-transition-preference", JSON.stringify("disabled"));

    const mockStartViewTransition = vi.fn((callback: () => void) => {
      callback();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };
    });

    (
      document as unknown as {
        startViewTransition: typeof mockStartViewTransition;
      }
    ).startViewTransition = mockStartViewTransition;

    const { result } = renderHook(() => useSidebarToggle());

    act(() => {
      result.current();
    });

    expect(mockStartViewTransition).not.toHaveBeenCalled();
    expect(useSidebarStore.getState().isSidebarOpen).toBe(false);
  });

  it("does not use document.startViewTransition in Firefox", () => {
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
      configurable: true,
    });

    const mockStartViewTransition = vi.fn((callback: () => void) => {
      callback();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };
    });

    (
      document as unknown as {
        startViewTransition: typeof mockStartViewTransition;
      }
    ).startViewTransition = mockStartViewTransition;

    const { result } = renderHook(() => useSidebarToggle());

    act(() => {
      result.current();
    });

    expect(mockStartViewTransition).not.toHaveBeenCalled();
    expect(useSidebarStore.getState().isSidebarOpen).toBe(false);

    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });
});
