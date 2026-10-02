import type { DocumentJSON, Tag } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import type { DatabaseDriver } from "./sql/schema";
import type { StorageAdapter, TagIndexRecord } from "./types";

import { getAllBlobs, getBlob, removeBlob, saveBlob } from "./sql/blob-ops";
import {
  deleteDocument,
  getAllDocuments,
  getDocument,
  saveDocument,
} from "./sql/document-ops";
import { ALL_DDL } from "./sql/schema";
import { deleteDocTags, getTagsIndex, saveDocTags } from "./sql/tag-index-ops";
import { getTags, saveTags } from "./sql/tag-ops";
import {
  deleteWorkspace,
  getWorkspaces,
  saveWorkspace,
} from "./sql/workspace-ops";
import { getWorkspaceTree, saveWorkspaceTree } from "./sql/workspace-tree-ops";

export type { DatabaseDriver };

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class TauriSqlAdapter implements StorageAdapter {
  private db: DatabaseDriver | null = null;
  private dbName: string;
  private initPromise: Promise<void> | null = null;

  constructor(dbName = "sqlite:yaad.db", customDbDriver?: DatabaseDriver) {
    this.dbName = dbName;

    if (customDbDriver) {
      this.db = customDbDriver;
    }
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (!this.db) {
        try {
          const sqlPlugin = await import("@tauri-apps/plugin-sql");
          const Database = sqlPlugin.default || sqlPlugin;
          this.db = await Database.load(this.dbName);
        } catch (error) {
          console.error(
            "[TauriSqlAdapter] Failed to load @tauri-apps/plugin-sql:",
            error,
          );
          throw error;
        }
      }

      const driver = this.db;
      await Promise.all(ALL_DDL.map((ddl) => driver.execute(ddl)));
    })();

    return this.initPromise;
  }

  private async getDb(): Promise<DatabaseDriver> {
    await this.init();
    return this.db!;
  }

  // -------------------------------------------------------------------------
  // WORKSPACE OPERATIONS
  // -------------------------------------------------------------------------

  async getWorkspaces(): Promise<Workspace[]> {
    return getWorkspaces(await this.getDb());
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    return saveWorkspace(await this.getDb(), workspace);
  }

  async deleteWorkspace(id: string): Promise<void> {
    return deleteWorkspace(await this.getDb(), id);
  }

  // -------------------------------------------------------------------------
  // WORKSPACE TREE
  // -------------------------------------------------------------------------

  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    return getWorkspaceTree(await this.getDb(), workspaceId);
  }

  async saveWorkspaceTree(
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ): Promise<void> {
    return saveWorkspaceTree(await this.getDb(), workspaceId, tree);
  }

  // -------------------------------------------------------------------------
  // DOCUMENT OPERATIONS
  // -------------------------------------------------------------------------

  async getDocument(id: string): Promise<DocumentJSON | null> {
    return getDocument(await this.getDb(), id);
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    return saveDocument(await this.getDb(), doc);
  }

  async deleteDocument(id: string): Promise<void> {
    return deleteDocument(await this.getDb(), id, (pageId) =>
      this.deleteDocTags(pageId),
    );
  }

  async getAllDocuments(): Promise<DocumentJSON[]> {
    return getAllDocuments(await this.getDb());
  }

  // -------------------------------------------------------------------------
  // TAG OPERATIONS
  // -------------------------------------------------------------------------

  async getTags(): Promise<Tag[]> {
    return getTags(await this.getDb());
  }

  async saveTags(tags: Tag[]): Promise<void> {
    return saveTags(await this.getDb(), tags);
  }

  // -------------------------------------------------------------------------
  // TAG INDEX OPERATIONS
  // -------------------------------------------------------------------------

  async saveDocTags(pageId: string, records: TagIndexRecord[]): Promise<void> {
    return saveDocTags(await this.getDb(), pageId, records);
  }

  async deleteDocTags(pageId: string): Promise<void> {
    return deleteDocTags(await this.getDb(), pageId);
  }

  async getTagsIndex(tagId?: string): Promise<TagIndexRecord[]> {
    return getTagsIndex(await this.getDb(), tagId);
  }

  // -------------------------------------------------------------------------
  // BLOB OPERATIONS
  // -------------------------------------------------------------------------

  async getBlob(id: string): Promise<Blob | undefined> {
    return getBlob(await this.getDb(), id);
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    return saveBlob(await this.getDb(), id, blob);
  }

  async removeBlob(id: string): Promise<void> {
    return removeBlob(await this.getDb(), id);
  }

  async getAllBlobs(): Promise<{ id: string; blob: Blob }[]> {
    return getAllBlobs(await this.getDb());
  }
}
