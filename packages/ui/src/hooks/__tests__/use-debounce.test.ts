import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "../use-debounce";

describe("useDebounce (Unit Test)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 250));

    expect(result.current).toBe("initial");
  });

  it("returns the updated value only after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 250),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe("b");
  });

  it("restarts the timer when the value keeps changing", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 250),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("c");
  });

  it("defaults to a 250ms delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(2);
  });
});
