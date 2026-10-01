import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlatformProvider } from "@/context/platform-context";

import { ActionHeaderBar } from "../action-header-bar";

const windowActions = {
  minimize: vi.fn(),
  toggleMaximize: vi.fn(),
  close: vi.fn(),
};

const expectNoDragRegion = (button: HTMLElement) => {
  expect(button.getAttribute("data-tauri-no-drag-region")).toBe("true");
};

const resetWindowActions = () => {
  windowActions.minimize.mockClear();
  windowActions.toggleMaximize.mockClear();
  windowActions.close.mockClear();
};

describe("ActionHeaderBar", () => {
  it("renders null when windowControls are not provided", () => {
    const { container } = render(<ActionHeaderBar />);
    expect(container.firstChild).toBeNull();
  });

  it("keeps titlebar controls out of the drag region and invokes window actions via PlatformProvider", () => {
    resetWindowActions();
    render(
      <PlatformProvider
        value={{ isDesktop: true, windowControls: windowActions }}
      >
        <ActionHeaderBar />
      </PlatformProvider>,
    );

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

  it("invokes window actions when passed directly as props", () => {
    resetWindowActions();
    render(<ActionHeaderBar windowControls={windowActions} />);

    const minimizeButton = screen.getByRole("button", {
      name: /minimize window/i,
    });
    fireEvent.click(minimizeButton);
    expect(windowActions.minimize).toHaveBeenCalledOnce();
  });
});
