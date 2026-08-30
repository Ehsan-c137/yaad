import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import { storage } from "@/lib/storage/storage-provider";

export class WorkspaceService {
  /**
   * Retrieves all workspaces.
   */
  async getWorkspaces(): Promise<Workspace[]> {
    return storage.getWorkspaces();
  }

  /**
   * Persists a workspace metadata object.
   */
  async saveWorkspace(workspace: Workspace): Promise<void> {
    await storage.saveWorkspace(workspace);
  }

  /**
   * Deletes a workspace and its associated page tree.
   */
  async deleteWorkspace(id: string): Promise<void> {
    await storage.deleteWorkspace(id);
  }

  /**
   * Fetches the page tree structure for a workspace.
   */
  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    return storage.getWorkspaceTree(workspaceId);
  }

  /**
   * Persists the page tree structure for a workspace.
   */
  async saveWorkspaceTree(
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ): Promise<void> {
    await storage.saveWorkspaceTree(workspaceId, tree);
  }
}

export const workspaceService = new WorkspaceService();
