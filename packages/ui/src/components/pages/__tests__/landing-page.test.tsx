import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LandingPage } from "../landing-page";

// Mock zustand stores & router
vi.mock("@yaad/core/store/use-workspace-store", () => ({
  useWorkspaceStore: vi.fn((selector) =>
    selector({
      activeWorkspaceId: "ws_test_123",
      workspaces: {
        ws_test_123: { id: "ws_test_123", name: "Test Workspace" },
      },
    }),
  ),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  configurable: true,
  writable: true,
});

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders main hero headline and platform download options", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // Headline check
    expect(screen.getByText(/where thoughts connect at the/i)).toBeDefined();
    expect(screen.getByText(/speed of light/i)).toBeDefined();

    // Check platform mentions
    expect(screen.getAllByText(/macos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/windows/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/linux/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/web app/i).length).toBeGreaterThan(0);
  });

  it("renders key feature bento cards with user-friendly descriptions", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/structure freely, visualize as a graph/i),
    ).toBeDefined();
    expect(screen.getByText(/flexible block canvas/i)).toBeDefined();
    expect(screen.getByText(/instant search/i)).toBeDefined();
    expect(screen.getByText(/your data stays on your device/i)).toBeDefined();
  });

  it("allows selecting workflow steps in How It Works section", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const step2 = screen.getByText(/2\. structure & nest/i);

    expect(step2).toBeDefined();

    fireEvent.click(step2);

    expect(screen.getByText(/infinite nested pages/i)).toBeDefined();
  });

  it("allows expanding and collapsing FAQ accordion questions", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const questionText = "Where are my notes and data stored?";
    const questionButton = screen.getByText(questionText);

    expect(questionButton).toBeDefined();

    // Click to expand
    fireEvent.click(questionButton);

    expect(screen.getByText(/100% locally on your own machine/i)).toBeDefined();
  });

  it("allows switching terminal package manager tabs and copying command", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const wingetTab = screen.getByRole("button", { name: /winget/i });
    fireEvent.click(wingetTab);

    expect(screen.getByText("winget install yaad")).toBeDefined();

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "winget install yaad",
    );
  });
});
