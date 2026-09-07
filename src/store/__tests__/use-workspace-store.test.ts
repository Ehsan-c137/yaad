import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Workspace } from "@/types/workspace";

import { workspaceService } from "@/services/workspace-service";

import type { WorkspaceUpdates } from "../use-workspace-store";

import { useSidebarStore } from "../use-sidebar-store";
import { useWorkspaceStore } from "../use-workspace-store";

vi.mock("@/services/workspace-service", () => ({
  workspaceService: {
    getWorkspaces: vi.fn(),
    saveWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    getWorkspaceTree: vi.fn(),
    saveWorkspaceTree: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const mockedWorkspaceService = vi.mocked(workspaceService);

function makeWorkspace(
  id: string,
  overrides: Partial<Workspace> = {},
): Workspace {
  return {
    id,
    name: id,
    icon: "💼",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("useWorkspaceStore (Unit Test)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedWorkspaceService.getWorkspaces.mockResolvedValue([]);
    mockedWorkspaceService.getWorkspaceTree.mockResolvedValue([]);
    localStorage.clear();
    useWorkspaceStore.setState({
      workspaces: {},
      activeWorkspaceId: null,
      hasHydrated: true,
    });
    useSidebarStore.setState({
      pages: {},
      rootPageIds: [],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
  });

  describe("loadInitialWorkspaces", () => {
    it("seeds a default workspace when storage is empty", async () => {
      mockedWorkspaceService.getWorkspaces.mockResolvedValue([]);

      await useWorkspaceStore.getState().loadInitialWorkspaces();

      expect(mockedWorkspaceService.saveWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "ws_personal",
          name: "Personal Workspace",
          icon: "🏠",
        }),
      );

      const saved = mockedWorkspaceService.saveWorkspace.mock.calls[0]?.[0];

      expect(saved).toMatchObject({
        id: "ws_personal",
        name: "Personal Workspace",
        icon: "🏠",
      });
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(
        "ws_personal",
      );
      expect(mockedWorkspaceService.getWorkspaceTree).toHaveBeenCalledWith(
        "ws_personal",
      );
    });

    it("loads stored workspaces and keeps a valid active id", async () => {
      useWorkspaceStore.setState({ activeWorkspaceId: "ws_b" });
      mockedWorkspaceService.getWorkspaces.mockResolvedValue([
        makeWorkspace("ws_a"),
        makeWorkspace("ws_b"),
      ]);

      await useWorkspaceStore.getState().loadInitialWorkspaces();

      expect(mockedWorkspaceService.saveWorkspace).not.toHaveBeenCalled();
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_b");
      expect(Object.keys(useWorkspaceStore.getState().workspaces)).toEqual([
        "ws_a",
        "ws_b",
      ]);
    });

    it("falls back to the first workspace when the active id is invalid", async () => {
      useWorkspaceStore.setState({ activeWorkspaceId: "ghost" });
      mockedWorkspaceService.getWorkspaces.mockResolvedValue([
        makeWorkspace("ws_a"),
        makeWorkspace("ws_b"),
      ]);

      await useWorkspaceStore.getState().loadInitialWorkspaces();

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_a");
    });
  });

  describe("createWorkspace", () => {
    it("persists and activates a new workspace", async () => {
      mockedWorkspaceService.getWorkspaceTree.mockResolvedValue([]);

      const id = await useWorkspaceStore
        .getState()
        .createWorkspace("Work", "🚀");

      expect(id).toMatch(/^ws_/);
      expect(mockedWorkspaceService.saveWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({ id, name: "Work", icon: "🚀" }),
      );
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(id);
      expect(useWorkspaceStore.getState().workspaces[id]).toMatchObject({
        name: "Work",
        icon: "🚀",
      });
    });

    it("defaults the icon to 💼", async () => {
      await useWorkspaceStore.getState().createWorkspace("Work");

      const saved = mockedWorkspaceService.saveWorkspace.mock.calls[0]?.[0];

      expect(saved).toMatchObject({ icon: "💼" });
    });
  });

  describe("updateWorkspace", () => {
    it("trims the name, applies updates and persists them", async () => {
      useWorkspaceStore.setState({
        workspaces: { ws_a: makeWorkspace("ws_a") },
        activeWorkspaceId: "ws_a",
      });

      const updates: WorkspaceUpdates = { name: "  Renamed  ", icon: "🔧" };

      await useWorkspaceStore.getState().updateWorkspace("ws_a", updates);

      expect(mockedWorkspaceService.saveWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({ id: "ws_a", name: "Renamed", icon: "🔧" }),
      );
      expect(useWorkspaceStore.getState().workspaces.ws_a?.name).toBe(
        "Renamed",
      );
    });

    it("rejects blank names with a toast and without persisting", async () => {
      useWorkspaceStore.setState({
        workspaces: { ws_a: makeWorkspace("ws_a") },
        activeWorkspaceId: "ws_a",
      });

      await useWorkspaceStore
        .getState()
        .updateWorkspace("ws_a", { name: "   " });

      expect(toast.error).toHaveBeenCalledWith(
        "Workspace name cannot be empty.",
      );
      expect(mockedWorkspaceService.saveWorkspace).not.toHaveBeenCalled();
    });

    it("ignores unknown workspaces", async () => {
      await useWorkspaceStore
        .getState()
        .updateWorkspace("ghost", { name: "X" });

      expect(mockedWorkspaceService.saveWorkspace).not.toHaveBeenCalled();
    });
  });

  describe("deleteWorkspace", () => {
    it("refuses to delete the last remaining workspace", async () => {
      useWorkspaceStore.setState({
        workspaces: { ws_a: makeWorkspace("ws_a") },
        activeWorkspaceId: "ws_a",
      });

      await useWorkspaceStore.getState().deleteWorkspace("ws_a");

      expect(toast.error).toHaveBeenCalledWith(
        "You must have at least one active workspace.",
      );
      expect(mockedWorkspaceService.deleteWorkspace).not.toHaveBeenCalled();
      expect(useWorkspaceStore.getState().workspaces.ws_a).toBeDefined();
    });

    it("deletes the workspace and activates the first remaining one", async () => {
      useWorkspaceStore.setState({
        workspaces: {
          ws_a: makeWorkspace("ws_a"),
          ws_b: makeWorkspace("ws_b"),
        },
        activeWorkspaceId: "ws_a",
      });
      mockedWorkspaceService.getWorkspaceTree.mockResolvedValue([]);

      await useWorkspaceStore.getState().deleteWorkspace("ws_a");

      expect(mockedWorkspaceService.deleteWorkspace).toHaveBeenCalledWith(
        "ws_a",
      );
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_b");
      expect(useWorkspaceStore.getState().workspaces.ws_a).toBeUndefined();
      expect(mockedWorkspaceService.getWorkspaceTree).toHaveBeenCalledWith(
        "ws_b",
      );
    });
  });

  describe("setActiveWorkspace", () => {
    it("ignores unknown workspace ids", async () => {
      useWorkspaceStore.setState({
        workspaces: { ws_a: makeWorkspace("ws_a") },
        activeWorkspaceId: "ws_a",
      });

      await useWorkspaceStore.getState().setActiveWorkspace("ghost");

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_a");
    });

    it("activates the workspace and loads its page tree", async () => {
      useWorkspaceStore.setState({
        workspaces: {
          ws_a: makeWorkspace("ws_a"),
          ws_b: makeWorkspace("ws_b"),
        },
        activeWorkspaceId: "ws_a",
      });
      mockedWorkspaceService.getWorkspaceTree.mockResolvedValue([]);

      await useWorkspaceStore.getState().setActiveWorkspace("ws_b");

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_b");
      expect(mockedWorkspaceService.getWorkspaceTree).toHaveBeenCalledWith(
        "ws_b",
      );
    });
  });
});
