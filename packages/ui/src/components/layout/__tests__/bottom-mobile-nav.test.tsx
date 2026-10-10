import { render, screen } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "@/hooks/use-media-query";

import { BottomMobileNav } from "../bottom-mobile-nav";

vi.mock("@/hooks/use-media-query");

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
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
});
