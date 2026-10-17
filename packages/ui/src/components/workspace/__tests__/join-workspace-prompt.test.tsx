import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { workspaceMemberService } from "@yaad/core/services/workspace-member-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JoinWorkspacePrompt } from "../join-workspace-prompt";

vi.mock("@yaad/core/services/workspace-member-service", () => ({
  workspaceMemberService: {
    joinWorkspace: vi.fn(),
  },
}));

vi.mock("@yaad/core/services/workspace-service", () => ({
  workspaceService: {
    saveWorkspace: vi.fn().mockResolvedValue(undefined),
    getWorkspaces: vi.fn().mockResolvedValue([]),
    getWorkspaceTree: vi.fn().mockResolvedValue([]),
    saveWorkspaceTree: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@yaad/core/store/use-sidebar-store", () => ({
  useSidebarStore: {
    getState: () => ({
      loadWorkspacePages: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe("JoinWorkspacePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.getState().clearAuth();
  });

  it("renders prompt and shows sign in button when not authenticated", () => {
    render(<JoinWorkspacePrompt workspaceId="ws_collab_999" />);

    expect(screen.getByText("Join Workspace")).toBeDefined();
    expect(screen.getByText("ws_collab_999")).toBeDefined();
    expect(screen.getByText("Sign In to Join")).toBeDefined();
  });

  it("allows joining workspace when user is authenticated", async () => {
    useUserStore.getState().setAuth({
      token: "jwt-token-join",
      userId: "u_joiner",
      email: "joiner@yaad.app",
    });

    const onJoined = vi.fn();
    vi.mocked(workspaceMemberService.joinWorkspace).mockResolvedValue({
      id: "mem_new",
      userId: "u_joiner",
      email: "joiner@yaad.app",
      role: "member",
      createdAt: new Date(),
      workspaceName: "Team Collaboration",
    });

    render(
      <JoinWorkspacePrompt workspaceId="ws_collab_999" onJoined={onJoined} />,
    );

    const joinButton = screen.getByRole("button", { name: /join workspace/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(workspaceMemberService.joinWorkspace).toHaveBeenCalledWith(
        "ws_collab_999",
      );
      expect(onJoined).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "ws_collab_999",
          name: "Team Collaboration",
        }),
      );
    });

    // Check workspace was registered in store
    expect(
      useWorkspaceStore.getState().workspaces["ws_collab_999"],
    ).toBeDefined();
  });
});
