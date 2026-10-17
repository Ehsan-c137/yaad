import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/i18n";

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
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("en");
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
    expect(screen.getAllByText(/notes/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/ideas, all in one place/i).length,
    ).toBeGreaterThan(0);

    // Check platform mentions
    expect(screen.getAllByText(/macos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/windows/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/linux/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/web app/i).length).toBeGreaterThan(0);
  });

  it("renders hero subtitle with sequential highlight reveal animation classes", () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const highlightSpans = container.querySelectorAll(".t-highlight-reveal");
    expect(highlightSpans.length).toBe(2);
    expect(highlightSpans[0].className).toContain("t-highlight-reveal--1");
    expect(highlightSpans[0].textContent).toContain(
      "Yaad is a fast, private note editor",
    );
    expect(highlightSpans[1].className).toContain("t-highlight-reveal--2");
    expect(highlightSpans[1].textContent).toContain("work completely offline");
  });

  it("renders key feature bento cards with user-friendly descriptions", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/visual knowledge graph/i)).toBeDefined();
    expect(screen.getByText(/block editor with slash commands/i)).toBeDefined();
    expect(screen.getByText(/instant search across all notes/i)).toBeDefined();
    expect(screen.getByText(/100% local & private/i)).toBeDefined();
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

  it("supports switching language via select menu and applies RTL direction", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // Initial state is English
    expect(document.documentElement.dir).toBe("ltr");
    const langSelect = screen.getByRole("combobox", {
      name: /switch language/i,
    });
    expect(langSelect).toBeDefined();
    expect(screen.getByText("English")).toBeDefined();

    // Open select dropdown and choose Persian
    fireEvent.click(langSelect);
    const faOption = screen.getByRole("option", { name: "فارسی" });
    fireEvent.pointerDown(faOption);
    fireEvent.click(faOption);

    // Check Persian UI and RTL attributes
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("fa");
    expect(screen.getAllByText(/یادداشت\u200cها/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/قابلیت\u200cها/).length).toBeGreaterThan(0);

    // Open select dropdown and switch back to English
    fireEvent.click(langSelect);
    const enOption = screen.getByRole("option", { name: "English" });
    fireEvent.pointerDown(enOption);
    fireEvent.click(enOption);

    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });

  it("applies horizontal overflow containment classes across main containers", () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const rootWrapper = container.firstElementChild!;
    expect(rootWrapper.className).toContain("overflow-x-clip");

    const mainContent = container.querySelector("#main-content")!;
    expect(mainContent.className).toContain("overflow-x-clip");
  });
});
