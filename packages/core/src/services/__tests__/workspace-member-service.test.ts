import { describe, expect, it, vi } from "vitest";

import { createWorkspaceMemberService } from "../workspace-member-service";

describe("WorkspaceMemberService", () => {
  const mockToken = "mock-jwt-token";
  const getToken = () => mockToken;

  it("fetches members with authorization header", async () => {
    const mockMembers = [
      {
        id: "1",
        userId: "u1",
        email: "alice@example.com",
        role: "owner",
        createdAt: new Date(),
      },
      {
        id: "2",
        userId: "u2",
        email: "bob@example.com",
        role: "member",
        createdAt: new Date(),
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMembers,
    });

    const service = createWorkspaceMemberService(
      "http://localhost:3000",
      getToken,
      mockFetch as any,
    );
    const members = await service.getMembers("ws-123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/workspaces/ws-123/members",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-jwt-token",
        },
      },
    );
    expect(members).toEqual(mockMembers);
  });

  it("adds a member via POST", async () => {
    const newMember = {
      id: "3",
      userId: "u3",
      email: "carol@example.com",
      role: "viewer",
      createdAt: new Date(),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => newMember,
    });

    const service = createWorkspaceMemberService(
      "http://localhost:3000",
      getToken,
      mockFetch as any,
    );
    const result = await service.addMember("ws-123", {
      email: "carol@example.com",
      role: "viewer",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/workspaces/ws-123/members",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-jwt-token",
        },
        body: JSON.stringify({ email: "carol@example.com", role: "viewer" }),
      },
    );
    expect(result).toEqual(newMember);
  });

  it("removes a member via DELETE", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const service = createWorkspaceMemberService(
      "http://localhost:3000",
      getToken,
      mockFetch as any,
    );
    await service.removeMember("ws-123", "u2");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/workspaces/ws-123/members/u2",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-jwt-token",
        },
      },
    );
  });

  it("joins a workspace via POST :workspaceId/join", async () => {
    const joined = {
      id: "4",
      userId: "u4",
      email: "dave@example.com",
      role: "member",
      createdAt: new Date(),
      workspaceName: "Dev Workspace",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => joined,
    });

    const service = createWorkspaceMemberService(
      "http://localhost:3000",
      getToken,
      mockFetch as any,
    );
    const result = await service.joinWorkspace("ws-123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/workspaces/ws-123/join",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-jwt-token",
        },
      },
    );
    expect(result).toEqual(joined);
  });

  it("throws descriptive error on failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Forbidden",
      json: async () => ({ message: "Cannot remove workspace owner" }),
    });

    const service = createWorkspaceMemberService(
      "http://localhost:3000",
      getToken,
      mockFetch as any,
    );
    await expect(service.removeMember("ws-123", "u1")).rejects.toThrow(
      "Cannot remove workspace owner",
    );
  });
});
