import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLocalStorage } from "../use-local-storage";

describe("useLocalStorage (Unit Test)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("theme", "light"));

    expect(result.current[0]).toBe("light");
  });

  it("returns the stored value when present", () => {
    localStorage.setItem("theme", JSON.stringify("dark"));

    const { result } = renderHook(() => useLocalStorage("theme", "light"));

    expect(result.current[0]).toBe("dark");
  });

  it("persists new values to localStorage as JSON", () => {
    const { result } = renderHook(() =>
      useLocalStorage("is-sidebar-open", true),
    );

    act(() => result.current[1](false));

    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem("is-sidebar-open")).toBe("false");
  });

  it("falls back to the initial value when the stored JSON is corrupt", () => {
    localStorage.setItem("theme", "{not-valid-json");

    const { result } = renderHook(() => useLocalStorage("theme", "light"));

    expect(result.current[0]).toBe("light");
  });
});
