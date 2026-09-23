import { fireEvent, render, screen } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSidebarPageItem } from "@/hooks/sidebar/use-sidebar-page-item";
import { useMediaQuery } from "@/hooks/use-media-query";

import { SidebarPageItem } from "../sidebar-page-item";

// Mock dependencies
vi.mock("@/hooks/sidebar/use-sidebar-page-item");
vi.mock("@yaad/core/store/use-sidebar-store");
vi.mock("@/hooks/use-media-query");

// Mock SidebarItemOptions to simplify the DOM
vi.mock("../sidebar-item-options", () => ({
  SidebarItemOptions: () => <div data-testid="sidebar-item-options" />,
}));

describe("SidebarPageItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useMediaQuery).mockReturnValue(false);

    vi.mocked(useSidebarStore).mockReturnValue({
      page1: { id: "page1", isDeleted: false },
      page2: { id: "page2", isDeleted: false },
    });

    vi.mocked(useSidebarPageItem).mockReturnValue({
      page: {
        id: "page1",
        title: "Test Page",
        icon: "📄",
        isExpanded: false,
        isDeleted: false,
        childrenIds: [],
      },
      isActive: false,
      hasChildren: false,
      handleNavigate: vi.fn(),
      handleToggleExpand: vi.fn(),
      handleCreateSubpage: vi.fn(),
    } as any);
  });

  it("renders null if page is deleted", () => {
    vi.mocked(useSidebarPageItem).mockReturnValue({
      page: { isDeleted: true },
    } as any);

    const { container } = render(<SidebarPageItem pageId="page1" />);

    expect(container.firstChild).toBeNull();
  });

  it("renders page title and icon", () => {
    render(<SidebarPageItem pageId="page1" />);

    expect(screen.getAllByText("Test Page").length).toBeGreaterThan(0);
    expect(screen.getAllByText("📄").length).toBeGreaterThan(0);
  });

  it("calls handleNavigate when clicking the page title button", () => {
    const handleNavigate = vi.fn();
    vi.mocked(useSidebarPageItem).mockReturnValue({
      page: { title: "Test Page", childrenIds: [] },
      isActive: false,
      hasChildren: false,
      handleNavigate,
      handleToggleExpand: vi.fn(),
      handleCreateSubpage: vi.fn(),
    } as any);

    render(<SidebarPageItem pageId="page1" />);

    const elements = screen.getAllByText("Test Page");
    fireEvent.click(elements[elements.length - 1]); // click the last one, usually the button

    expect(handleNavigate).toHaveBeenCalledWith();
  });

  it("shows children when expanded and has children", () => {
    vi.mocked(useSidebarPageItem).mockImplementation((pageId) => {
      if (pageId === "page1") {
        return {
          page: {
            id: "page1",
            title: "Parent",
            isExpanded: true,
            isDeleted: false,
            childrenIds: ["page2"],
          },
          isActive: false,
          hasChildren: true,
          handleNavigate: vi.fn(),
          handleToggleExpand: vi.fn(),
          handleCreateSubpage: vi.fn(),
        } as any;
      }

      return {
        page: {
          id: "page2",
          title: "Child",
          isExpanded: false,
          isDeleted: false,
          childrenIds: [],
        },
        isActive: false,
        hasChildren: false,
        handleNavigate: vi.fn(),
        handleToggleExpand: vi.fn(),
        handleCreateSubpage: vi.fn(),
      } as any;
    });

    render(<SidebarPageItem pageId="page1" />);

    expect(screen.getAllByText("Parent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Child").length).toBeGreaterThan(0);
  });
});
