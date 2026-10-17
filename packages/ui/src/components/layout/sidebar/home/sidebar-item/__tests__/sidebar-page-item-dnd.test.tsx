import { fireEvent, render, screen } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetDndState } from "@/hooks/sidebar/use-sidebar-dnd";
import { useSidebarPageItem } from "@/hooks/sidebar/use-sidebar-page-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";

import { SidebarPageItem } from "../sidebar-page-item";

vi.mock("@/hooks/sidebar/use-sidebar-page-item");
vi.mock("@yaad/core/store/use-sidebar-store");
vi.mock("@yaad/core/store/use-workspace-store");
vi.mock("@/hooks/use-media-query");
vi.mock("@/hooks/workspace/use-workspace-permissions");
vi.mock("../sidebar-item-options", () => ({
  SidebarItemOptions: () => <div data-testid="sidebar-item-options" />,
}));

describe("SidebarPageItem Drag and Drop", () => {
  const movePageInTreeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetDndState();
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(useWorkspaceStore).mockReturnValue("ws_1");
    vi.mocked(useWorkspacePermissions).mockReturnValue({
      isReadOnly: false,
    } as any);

    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {
          page1: {
            id: "page1",
            title: "Page 1",
            icon: "📄",
            parentId: null,
            childrenIds: [],
            isExpanded: false,
            isDeleted: false,
          },
          page2: {
            id: "page2",
            title: "Page 2",
            icon: "📄",
            parentId: null,
            childrenIds: [],
            isExpanded: false,
            isDeleted: false,
          },
        },
        rootPageIds: ["page1", "page2"],
        movePageInTree: movePageInTreeMock,
        toggleExpand: vi.fn(),
      };
      return selector(state);
    });

    vi.mocked(useSidebarPageItem).mockImplementation(
      (pageId: string) =>
        ({
          page: {
            id: pageId,
            title: pageId === "page1" ? "Page 1" : "Page 2",
            icon: "📄",
            parentId: null,
            childrenIds: [],
            isExpanded: false,
            isDeleted: false,
          },
          isActive: false,
          hasChildren: false,
          handleNavigate: vi.fn(),
          handleToggleExpand: vi.fn(),
          handleCreateSubpage: vi.fn(),
        }) as any,
    );
  });

  it("is draggable when workspace is not read-only", () => {
    render(<SidebarPageItem pageId="page1" />);
    const item = screen.getByTestId("sidebar-page-item-page1");
    expect(item.getAttribute("draggable")).toBe("true");
  });

  it("is not draggable when workspace is read-only", () => {
    vi.mocked(useWorkspacePermissions).mockReturnValue({
      isReadOnly: true,
    } as any);

    render(<SidebarPageItem pageId="page1" />);
    const item = screen.getByTestId("sidebar-page-item-page1");
    expect(item.getAttribute("draggable")).toBe("false");
  });

  it("handles drag start by attaching page id to dataTransfer", () => {
    render(<SidebarPageItem pageId="page1" />);
    const item = screen.getByTestId("sidebar-page-item-page1");

    const setData = vi.fn();
    fireEvent.dragStart(item, {
      dataTransfer: {
        setData,
        effectAllowed: "none",
      },
    });

    expect(setData).toHaveBeenCalledWith("text/plain", "page1");
  });

  it("renders drop indicator on drag over and calls movePageInTree on drop", () => {
    render(
      <div>
        <SidebarPageItem pageId="page1" />
        <SidebarPageItem pageId="page2" />
      </div>,
    );

    const item1 = screen.getByTestId("sidebar-page-item-page1");
    const item2 = screen.getByTestId("sidebar-page-item-page2");

    // Start dragging item 1
    fireEvent.dragStart(item1, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: "none",
      },
    });

    // Mock getBoundingClientRect for item 2: top: 100, height: 40
    vi.spyOn(item2, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 140,
      height: 40,
      left: 0,
      right: 200,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    // Hover over top 10% -> 'before'
    fireEvent.dragOver(item2, {
      clientY: 105,
      dataTransfer: { dropEffect: "none" },
    });
    expect(screen.getByTestId("drop-indicator-before")).toBeDefined();

    // Drop on item 2 with 'before'
    fireEvent.drop(item2, {
      clientY: 105,
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "page1" : ""),
      },
    });

    expect(movePageInTreeMock).toHaveBeenCalledWith("page1", "page2", "before");
  });
});
