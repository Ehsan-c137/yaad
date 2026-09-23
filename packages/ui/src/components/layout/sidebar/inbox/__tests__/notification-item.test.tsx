import { fireEvent, render, screen } from "@testing-library/react";
import { useInboxStore } from "@yaad/core/store/inbox/use-inbox-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationItem } from "../notification-item";

// Mock dependencies
vi.mock("@yaad/core/store/inbox/use-inbox-store");
vi.mock("@yaad/core/store/use-tab-store");
vi.mock("@yaad/core/store/use-workspace-store");
vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

describe("NotificationItem", () => {
  const mockNavigate = vi.fn();
  const mockMarkAsRead = vi.fn();
  const mockToggleRead = vi.fn();
  const mockDeleteNotification = vi.fn();
  const mockOpenTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useWorkspaceStore).mockImplementation((selector: any) =>
      selector({ activeWorkspaceId: "ws1" }),
    );

    vi.mocked(useTabStore).mockImplementation((selector: any) =>
      selector({ openTab: mockOpenTab }),
    );

    vi.mocked(useInboxStore).mockImplementation((selector: any) =>
      selector({
        markAsRead: mockMarkAsRead,
        toggleRead: mockToggleRead,
        deleteNotification: mockDeleteNotification,
      }),
    );
  });

  it("renders notification details correctly", () => {
    const notification = {
      id: "notif1",
      title: "New comment on page",
      description: "Someone commented on your page",
      type: "comment" as const,
      createdAt: Date.now(),
      read: false,
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getAllByText("New comment on page").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Someone commented on your page").length,
    ).toBeGreaterThan(0);
  });

  it("calls click handlers correctly", () => {
    const notification = {
      id: "notif1",
      title: "Page updated",
      description: "Page was updated",
      type: "page_update" as const,
      createdAt: Date.now(),
      read: false,
      pageId: "page1",
      targetTitle: "My Page",
    };

    render(<NotificationItem notification={notification} />);

    const itemContainer = screen.getAllByRole("button", { hidden: true })[0];
    fireEvent.click(itemContainer);

    expect(mockMarkAsRead).toHaveBeenCalledWith("notif1");
    expect(mockOpenTab).toHaveBeenCalledWith({
      pageId: "page1",
      workspaceId: "ws1",
      title: "My Page",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/workspace/ws1/page1");
  });

  it("handles mark as read and delete from hover actions", () => {
    const notification = {
      id: "notif1",
      title: "Reminder",
      description: "Action required",
      type: "reminder" as const,
      createdAt: Date.now(),
      read: false,
    };

    render(<NotificationItem notification={notification} />);

    const toggleButton = screen.getAllByLabelText("Mark as read")[0];
    fireEvent.click(toggleButton);

    expect(mockToggleRead).toHaveBeenCalledWith("notif1");

    const deleteButton = screen.getAllByLabelText("Delete notification")[0];
    fireEvent.click(deleteButton);

    expect(mockDeleteNotification).toHaveBeenCalledWith("notif1");
  });
});
