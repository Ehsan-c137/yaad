import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TrashPage } from "../trash-page";

// Mock dependencies
vi.mock("@ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@yaad/core/store/use-sidebar-store");
vi.mock("@yaad/core/store/use-workspace-store");
vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));
vi.mock("@/components/ui/link", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TrashPage", () => {
  const mockNavigate = vi.fn();
  const mockRestorePage = vi.fn();
  const mockPermanentlyDeletePage = vi.fn();
  const mockEmptyTrash = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useWorkspaceStore).mockReturnValue({
      ws1: { id: "ws1", name: "My Workspace" },
    });

    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {},
        restorePage: mockRestorePage,
        permanentlyDeletePage: mockPermanentlyDeletePage,
        emptyTrash: mockEmptyTrash,
      };
      return selector(state);
    });
  });

  it("renders empty state when no pages are in trash", () => {
    render(<TrashPage workspaceId="ws1" />);

    expect(screen.getAllByText("Trash is empty").length).toBeGreaterThan(0);
    expect(screen.queryByText("Empty Trash")).toBeNull();
  });

  it("renders trashed pages", () => {
    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {
          page1: { id: "page1", title: "Deleted Page 1", isDeleted: true },
          page2: { id: "page2", title: "Active Page", isDeleted: false },
        },
        restorePage: mockRestorePage,
        permanentlyDeletePage: mockPermanentlyDeletePage,
        emptyTrash: mockEmptyTrash,
      };
      return selector(state);
    });

    render(<TrashPage workspaceId="ws1" />);

    expect(screen.getAllByText("Deleted Page 1").length).toBeGreaterThan(0);
    expect(screen.queryByText("Active Page")).toBeNull();
    expect(screen.getAllByText("Empty Trash").length).toBeGreaterThan(0);
  });

  it("calls restorePage when clicking restore", () => {
    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {
          page1: { id: "page1", title: "Deleted Page 1", isDeleted: true },
        },
        restorePage: mockRestorePage,
        permanentlyDeletePage: mockPermanentlyDeletePage,
        emptyTrash: mockEmptyTrash,
      };
      return selector(state);
    });

    render(<TrashPage workspaceId="ws1" />);

    const restoreButton = screen.getAllByTitle("Restore page")[0];
    fireEvent.click(restoreButton);

    expect(mockRestorePage).toHaveBeenCalledWith("page1");
  });

  it("opens delete confirmation and deletes permanently", async () => {
    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {
          page1: { id: "page1", title: "Deleted Page 1", isDeleted: true },
        },
        restorePage: mockRestorePage,
        permanentlyDeletePage: mockPermanentlyDeletePage,
        emptyTrash: mockEmptyTrash,
      };
      return selector(state);
    });

    render(<TrashPage workspaceId="ws1" />);

    const deleteButton = screen.getAllByTitle("Delete permanently")[0];
    fireEvent.click(deleteButton);

    // Dialog should open
    expect(
      (await screen.findAllByText("Permanently delete page?")).length,
    ).toBeGreaterThan(0);

    const confirmButton = await screen.findByRole("button", {
      name: "Delete permanently",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockPermanentlyDeletePage).toHaveBeenCalledWith("page1");
    });
  });

  it("filters trashed pages by search", () => {
    vi.mocked(useSidebarStore).mockImplementation((selector: any) => {
      const state = {
        pages: {
          page1: { id: "page1", title: "Apple", isDeleted: true },
          page2: { id: "page2", title: "Banana", isDeleted: true },
        },
        restorePage: mockRestorePage,
        permanentlyDeletePage: mockPermanentlyDeletePage,
        emptyTrash: mockEmptyTrash,
      };
      return selector(state);
    });

    render(<TrashPage workspaceId="ws1" />);

    expect(screen.getAllByText("Apple").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Banana").length).toBeGreaterThan(0);

    const searchInput = screen.getByPlaceholderText("Search trash...");
    fireEvent.change(searchInput, { target: { value: "app" } });

    expect(screen.getAllByText("Apple").length).toBeGreaterThan(0);
    expect(screen.queryByText("Banana")).toBeNull();
  });
});
