import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "../use-media-query";

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();

  const matchMedia = vi.fn((query: string) => ({
    matches: initialMatches,
    media: query,
    addEventListener: vi.fn(
      (_type: string, cb: (event: { matches: boolean }) => void) => {
        listeners.add(cb);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, cb: (event: { matches: boolean }) => void) => {
        listeners.delete(cb);
      },
    ),
  }));

  vi.stubGlobal("matchMedia", matchMedia);

  return {
    matchMedia,
    fire: (nextMatches: boolean) => {
      listeners.forEach((cb) => cb({ matches: nextMatches }));
    },
  };
}

describe("useMediaQuery (Unit Test)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the initial match state", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("maps breakpoint aliases to media queries", () => {
    const { matchMedia } = stubMatchMedia(false);
    renderHook(() => useMediaQuery("md"));

    expect(matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
  });

  it("passes raw queries through untouched", () => {
    const { matchMedia } = stubMatchMedia(false);
    renderHook(() => useMediaQuery("(prefers-color-scheme: dark)"));

    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });

  it("reacts to change events from matchMedia", () => {
    const { fire } = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("lg"));

    expect(result.current).toBe(false);

    act(() => fire(true));

    expect(result.current).toBe(true);
  });

  it("stops listening after unmount", () => {
    const { fire } = stubMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery("lg"));

    unmount();
    act(() => fire(true));

    expect(result.current).toBe(false);
  });
});
