import { render, screen } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "@/hooks/use-media-query";

import { BottomMobileNav } from "../bottom-mobile-nav";

vi.mock("@/hooks/use-media-query");

let mockPathname = "/workspace/workspace-1";

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/search/search-command", () => ({
  SearchBox: () => <div data-testid="search-box">Search</div>,
}));

describe("BottomMobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({ activeWorkspaceId: "workspace-1" });
    useSidebarStore.setState({ isSidebarOpen: false });
  });

  it("renders null on desktop viewports", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const { container } = render(<BottomMobileNav />);
    expect(container.firstChild).toBeNull();
  });

  it("renders null if there is no active workspace", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    const { container } = render(<BottomMobileNav />);
    expect(container.firstChild).toBeNull();
  });

  it("renders in mobile view with z-30 when sidebar is closed", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    useSidebarStore.setState({ isSidebarOpen: false });

    render(<BottomMobileNav />);
    const nav = screen.getByRole("navigation", { name: "Mobile navigation" });

    expect(nav).toBeTruthy();
    expect(nav.className).toContain("z-30");
    expect(nav.className).toContain("rounded-full");
    expect(nav.className).toContain("inset-x-4");
    expect(nav.getAttribute("aria-hidden")).toBe("false");
    expect(nav.className).not.toContain("pointer-events-none");
    expect(nav.hasAttribute("inert")).toBe(false);
  });

  it("becomes non-interactive and aria-hidden when sidebar is open on mobile", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    useSidebarStore.setState({ isSidebarOpen: true });

    render(<BottomMobileNav />);
    const nav = screen.getByRole("navigation", { hidden: true });

    expect(nav).toBeTruthy();
    expect(nav.className).toContain("z-30");
    expect(nav.getAttribute("aria-hidden")).toBe("true");
    expect(nav.className).toContain("pointer-events-none");
    expect(nav.className).toContain("select-none");
    expect(nav.hasAttribute("inert")).toBe(true);
  });

  it("reveals calendar dock items with animation when navigating to calendar route", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    useSidebarStore.setState({ isSidebarOpen: false });
    mockPathname = "/workspace/workspace-1/calendar";

    render(<BottomMobileNav />);

    // Search is shifted out of the dock row to the top navigation header
    expect(screen.queryByTestId("search-box")).toBeNull();
    // Primary action is present as floating action button (FAB)
    expect(screen.getByRole("button", { name: "Add event" })).toBeDefined();

    // 4 core calendar navigation tabs are present in dock
    expect(screen.getByText("Inbox")).toBeDefined();
    expect(screen.getByText("Today")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("Browse")).toBeDefined();
  });
});
