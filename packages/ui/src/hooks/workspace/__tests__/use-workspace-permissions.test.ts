import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useUserStore } from "@yaad/core/store/use-user-store";
import type { IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";
import {
  emitLiveWorkspaceRoleChange,
  useWorkspacePermissions,
} from "../use-workspace-permissions";

describe("useWorkspacePermissions (Unit Test)", () => {
  beforeEach(() => {
    useUserStore.setState({
      userId: null,
      token: null,
    });
  });

  it("defaults to owner permissions when unauthenticated (offline/guest mode)", () => {
    const { result } = renderHook(() => useWorkspacePermissions("ws_custom"));

    expect(result.current.role).toBe("owner");
    expect(result.current.isReadOnly).toBe(false);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canManage).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("defaults to owner permissions for personal workspace ws_personal even if authenticated", () => {
    useUserStore.setState({
      userId: "user_123",
      token: "jwt_token",
    });

    const { result } = renderHook(() => useWorkspacePermissions("ws_personal"));

    expect(result.current.role).toBe("owner");
    expect(result.current.isReadOnly).toBe(false);
  });

  it("detects viewer role and sets isReadOnly to true when user has viewer role", async () => {
    useUserStore.setState({
      userId: "user_viewer",
      token: "jwt_token",
    });

    const mockMemberService: IWorkspaceMemberService = {
      getMembers: vi.fn().mockResolvedValue([
        {
          id: "m_1",
          userId: "user_viewer",
          email: "viewer@example.com",
          role: "viewer",
          createdAt: new Date(),
        },
      ]),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      joinWorkspace: vi.fn(),
    };

    const { result } = renderHook(() =>
      useWorkspacePermissions("ws_collab", { memberService: mockMemberService }),
    );

    await waitFor(() => {
      expect(result.current.role).toBe("viewer");
      expect(result.current.isReadOnly).toBe(true);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canManage).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("detects member role and sets isReadOnly to false with canEdit true", async () => {
    useUserStore.setState({
      userId: "user_editor",
      token: "jwt_token",
    });

    const mockMemberService: IWorkspaceMemberService = {
      getMembers: vi.fn().mockResolvedValue([
        {
          id: "m_2",
          userId: "user_editor",
          email: "editor@example.com",
          role: "member",
          createdAt: new Date(),
        },
      ]),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      joinWorkspace: vi.fn(),
    };

    const { result } = renderHook(() =>
      useWorkspacePermissions("ws_collab", { memberService: mockMemberService }),
    );

    await waitFor(() => {
      expect(result.current.role).toBe("member");
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.canManage).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("updates permissions dynamically when emitLiveWorkspaceRoleChange is invoked", async () => {
    useUserStore.setState({
      userId: "user_editor",
      token: "jwt_token",
    });

    const mockMemberService: IWorkspaceMemberService = {
      getMembers: vi.fn().mockResolvedValue([
        {
          id: "m_2",
          userId: "user_editor",
          email: "editor@example.com",
          role: "member",
          createdAt: new Date(),
        },
      ]),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      joinWorkspace: vi.fn(),
    };

    const { result } = renderHook(() =>
      useWorkspacePermissions("ws_collab", { memberService: mockMemberService }),
    );

    await waitFor(() => {
      expect(result.current.role).toBe("member");
      expect(result.current.isReadOnly).toBe(false);
    });

    // Dynamically emit live role downgrade from 'member' to 'viewer'
    emitLiveWorkspaceRoleChange("ws_collab", "viewer");

    await waitFor(() => {
      expect(result.current.role).toBe("viewer");
      expect(result.current.isReadOnly).toBe(true);
      expect(result.current.canEdit).toBe(false);
    });
  });
});
