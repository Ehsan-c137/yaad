import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActionHeaderBar } from "../action-header-bar";

const windowActions = vi.hoisted(() => ({
  minimize: vi.fn(),
  toggleMaximize: vi.fn(),
  close: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    ...windowActions,
  })),
}));

const expectNoDragRegion = (button: HTMLElement) => {
  expect(button.getAttribute("data-tauri-no-drag-region")).toBe("true");
};

const resetWindowActions = () => {
  windowActions.minimize.mockClear();
  windowActions.toggleMaximize.mockClear();
  windowActions.close.mockClear();
};

describe("ActionHeaderBar", () => {
  it("keeps titlebar controls out of the drag region and invokes window actions", () => {
    resetWindowActions();
    render(<ActionHeaderBar />);

    const minimizeButton = screen.getByRole("button", {
      name: /minimize window/i,
    });
    const maximizeButton = screen.getByRole("button", {
      name: /maximize window/i,
    });
    const closeButton = screen.getByRole("button", {
      name: /close window/i,
    });

    expectNoDragRegion(minimizeButton);
    expectNoDragRegion(maximizeButton);
    expectNoDragRegion(closeButton);

    fireEvent.click(minimizeButton);
    fireEvent.click(maximizeButton);
    fireEvent.click(closeButton);

    expect(windowActions.minimize).toHaveBeenCalledExactlyOnceWith();
    expect(windowActions.toggleMaximize).toHaveBeenCalledExactlyOnceWith();
    expect(windowActions.close).toHaveBeenCalledExactlyOnceWith();
  });
});
