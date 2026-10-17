import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ToggleThemeButton } from "../toggle-theme-button";

describe("ToggleThemeButton (Component Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("reflects unchecked when app is in light mode", () => {
    render(<ToggleThemeButton />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement.getAttribute("aria-checked")).toBe("false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("reflects checked when app starts in dark mode", () => {
    document.documentElement.classList.add("dark");

    render(<ToggleThemeButton />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles dark mode on and off properly", () => {
    render(<ToggleThemeButton />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement.getAttribute("aria-checked")).toBe("false");

    act(() => {
      fireEvent.click(switchElement);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe(JSON.stringify("dark"));
    expect(switchElement.getAttribute("aria-checked")).toBe("true");

    act(() => {
      fireEvent.click(switchElement);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe(JSON.stringify("light"));
    expect(switchElement.getAttribute("aria-checked")).toBe("false");
  });
});
