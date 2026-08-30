import { del, get, set } from "idb-keyval";

import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import type { StorageAdapter } from "./types";

import { blobStorage } from "./blob-storage";

const WORKSPACES_KEY = "app_workspaces_v1";

export class LocalJsonAdapter implements StorageAdapter {
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const workspaces = await get<Workspace[]>(WORKSPACES_KEY);
      return workspaces ?? [];
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      const workspaces = await this.getWorkspaces();
      const index = workspaces.findIndex((w) => w.id === workspace.id);

      if (index >= 0) {
        workspaces[index] = workspace;
      } else {
        workspaces.push(workspace);
      }

      await set(WORKSPACES_KEY, workspaces);
    } catch (error) {
      console.error("[LocalJsonAdapter] Error saving workspace:", error);
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      const workspaces = await this.getWorkspaces();
      const updated = workspaces.filter((w) => w.id !== id);
      await set(WORKSPACES_KEY, updated);

      await del(`tree_${id}`);
    } catch (error) {
      console.error("[LocalJsonAdapter] Error deleting workspace:", error);
    }
  }

  // WORKSPACE TREE
  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    try {
      const tree = await get<WorkspacePageMeta[]>(`tree_${workspaceId}`);
      return tree || [];
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error loading tree for workspace ${workspaceId}:`,
        error,
      );
      return [];
    }
  }

  async saveWorkspaceTree(
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ): Promise<void> {
    try {
      await set(`tree_${workspaceId}`, tree);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error saving tree for workspace ${workspaceId}:`,
        error,
      );
    }
  }

  // DOCUMENT
  async getDocument(id: string): Promise<DocumentJSON | null> {
    try {
      const doc = await get<DocumentJSON>(`doc_${id}`);
      return doc || null;
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error loading document ${id}:`, error);
      return null;
    }
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    try {
      await set(`doc_${doc.id}`, doc);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error saving document ${doc.id}:`,
        error,
      );
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await del(`doc_${id}`);
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error deleting document ${id}:`, error);
    }
  }

  // BLOB
  async getBlob(id: string): Promise<Blob | undefined> {
    try {
      return await blobStorage.get(id);
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error loading blob ${id}:`, error);
      return undefined;
    }
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    try {
      await blobStorage.save(id, blob);
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error saving blob ${id}:`, error);
    }
  }

  async removeBlob(id: string): Promise<void> {
    try {
      await blobStorage.remove(id);
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error deleting blob ${id}:`, error);
    }
  }
}
