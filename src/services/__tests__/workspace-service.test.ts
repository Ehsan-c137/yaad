import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import { storage } from "@/lib/storage/storage-provider";

import { workspaceService } from "../workspace-service";

vi.mock("@/lib/storage/storage-provider", () => ({
  storage: {
    getWorkspaces: vi.fn(),
    saveWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    getWorkspaceTree: vi.fn(),
    saveWorkspaceTree: vi.fn(),
    getDocument: vi.fn(),
    saveDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getBlob: vi.fn(),
    saveBlob: vi.fn(),
    removeBlob: vi.fn(),
  },
}));

const mockedStorage = vi.mocked(storage);

const workspace: Workspace = {
  id: "ws_1",
  name: "Personal",
  icon: "🏠",
  createdAt: 1,
  updatedAt: 1,
};

const tree: WorkspacePageMeta[] = [
  {
    id: "page_1",
    workspaceId: "ws_1",
    title: "P",
    parentId: null,
    childrenIds: [],
    updatedAt: 1,
  },
];

describe("WorkspaceService (Integration Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates workspace reads and writes to the storage adapter", async () => {
    mockedStorage.getWorkspaces.mockResolvedValue([workspace]);
    mockedStorage.saveWorkspace.mockResolvedValue(undefined);
    mockedStorage.deleteWorkspace.mockResolvedValue(undefined);

    await expect(workspaceService.getWorkspaces()).resolves.toEqual([
      workspace,
    ]);

    await workspaceService.saveWorkspace(workspace);
    await workspaceService.deleteWorkspace("ws_1");

    expect(mockedStorage.getWorkspaces).toHaveBeenCalledExactlyOnceWith();
    expect(mockedStorage.saveWorkspace).toHaveBeenCalledWith(workspace);
    expect(mockedStorage.deleteWorkspace).toHaveBeenCalledWith("ws_1");
  });

  it("delegates page tree reads and writes to the storage adapter", async () => {
    mockedStorage.getWorkspaceTree.mockResolvedValue(tree);
    mockedStorage.saveWorkspaceTree.mockResolvedValue(undefined);

    await expect(workspaceService.getWorkspaceTree("ws_1")).resolves.toBe(tree);

    await workspaceService.saveWorkspaceTree("ws_1", tree);

    expect(mockedStorage.getWorkspaceTree).toHaveBeenCalledWith("ws_1");
    expect(mockedStorage.saveWorkspaceTree).toHaveBeenCalledWith("ws_1", tree);
  });
});
