import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShareModal } from "../share-modal";

describe("ShareModal", () => {
  const mockMemberService = {
    getMembers: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.getState().clearAuth();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
      writable: true,
    });
  });

  it("shows guest notice when user is not authenticated", () => {
    render(
      <ShareModal
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws_1"
        workspaceName="Personal"
        memberService={mockMemberService}
      />,
    );

    expect(screen.getByText(/Share.*Personal/i)).toBeDefined();
    expect(
      screen.getByText(/Sign In to Invite Collaborators/i),
    ).toBeDefined();
  });

  it("loads and displays workspace members when authenticated", async () => {
    useUserStore.getState().setAuth({
      token: "jwt-token-123",
      userId: "u_owner",
      email: "owner@yaad.app",
    });

    mockMemberService.getMembers.mockResolvedValue([
      {
        id: "m1",
        userId: "u_owner",
        email: "owner@yaad.app",
        role: "owner",
        createdAt: new Date(),
      },
      {
        id: "m2",
        userId: "u_editor",
        email: "editor@yaad.app",
        role: "member",
        createdAt: new Date(),
      },
    ]);

    render(
      <ShareModal
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws_1"
        workspaceName="Engineering"
        memberService={mockMemberService}
      />,
    );

    expect(mockMemberService.getMembers).toHaveBeenCalledWith("ws_1");

    await waitFor(() => {
      expect(screen.getByText("owner@yaad.app")).toBeDefined();
      expect(screen.getByText("editor@yaad.app")).toBeDefined();
    });

    expect(screen.getAllByText("Owner").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Can edit/i).length).toBeGreaterThan(0);
  });

  it("allows inviting a collaborator with role", async () => {
    useUserStore.getState().setAuth({
      token: "jwt-token-123",
      userId: "u_owner",
      email: "owner@yaad.app",
    });

    mockMemberService.getMembers.mockResolvedValue([]);
    mockMemberService.addMember.mockResolvedValue({
      id: "m3",
      userId: "u_new",
      email: "alice@yaad.app",
      role: "viewer",
      createdAt: new Date(),
    });

    render(
      <ShareModal
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws_1"
        workspaceName="Engineering"
        memberService={mockMemberService}
      />,
    );

    const emailInput = screen.getByPlaceholderText("colleague@example.com");
    fireEvent.change(emailInput, { target: { value: "alice@yaad.app" } });

    const roleSelect = screen.getByLabelText("Collaborator role");
    fireEvent.change(roleSelect, { target: { value: "viewer" } });

    const inviteButton = screen.getByRole("button", { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockMemberService.addMember).toHaveBeenCalledWith("ws_1", {
        email: "alice@yaad.app",
        role: "viewer",
      });
      expect(screen.getByText("alice@yaad.app")).toBeDefined();
    });
  });

  it("allows removing a non-owner member", async () => {
    useUserStore.getState().setAuth({
      token: "jwt-token-123",
      userId: "u_owner",
      email: "owner@yaad.app",
    });

    mockMemberService.getMembers.mockResolvedValue([
      {
        id: "m2",
        userId: "u_editor",
        email: "editor@yaad.app",
        role: "member",
        createdAt: new Date(),
      },
    ]);
    mockMemberService.removeMember.mockResolvedValue(undefined);

    render(
      <ShareModal
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws_1"
        workspaceName="Engineering"
        memberService={mockMemberService}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("editor@yaad.app")).toBeDefined();
    });

    const removeBtn = screen.getByRole("button", {
      name: /Remove editor@yaad.app/i,
    });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(mockMemberService.removeMember).toHaveBeenCalledWith("ws_1", "u_editor");
      expect(screen.queryByText("editor@yaad.app")).toBeNull();
    });
  });

  it("copies share link to clipboard", async () => {
    render(
      <ShareModal
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws_abc"
        workspaceName="Demo"
        pageId="page_123"
        memberService={mockMemberService}
      />,
    );

    const copyBtn = screen.getByRole("button", { name: /copy link/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/workspace/ws_abc/page_123"),
      );
    });
  });
});
