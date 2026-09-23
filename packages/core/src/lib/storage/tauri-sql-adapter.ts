import type { DocumentJSON, Tag } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import type { StorageAdapter, TagIndexRecord } from "./types";

export interface DatabaseDriver {
  execute: (
    query: string,
    bindValues?: unknown[],
  ) => Promise<{ rowsAffected: number }>;
  select: <T = unknown>(query: string, bindValues?: unknown[]) => Promise<T>;
}

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

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS workspaces (
          id TEXT PRIMARY KEY,
          json TEXT NOT NULL,
          updated_at INTEGER
        );
      `);

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS workspace_trees (
          workspace_id TEXT PRIMARY KEY,
          json TEXT NOT NULL,
          updated_at INTEGER
        );
      `);

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          json TEXT NOT NULL,
          updated_at INTEGER
        );
      `);

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS blobs (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          type TEXT,
          updated_at INTEGER
        );
      `);

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS block_tags (
          tag_id TEXT NOT NULL,
          page_id TEXT NOT NULL,
          block_id TEXT NOT NULL,
          block_type TEXT NOT NULL,
          snippet TEXT,
          updated_at INTEGER,
          PRIMARY KEY (tag_id, page_id, block_id)
        );
      `);

      await driver.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at INTEGER,
          updated_at INTEGER,
          json TEXT NOT NULL
        );
      `);

      await driver.execute(`
        CREATE INDEX IF NOT EXISTS idx_block_tags_tag_id ON block_tags(tag_id);
      `);
    })();

    return this.initPromise;
  }

  private async getDb(): Promise<DatabaseDriver> {
    if (!this.db) {
      await this.init();
    }

    return this.db!;
  }

  // WORKSPACE OPERATIONS
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ json: string }[]>(
        "SELECT json FROM workspaces ORDER BY updated_at DESC;",
      );
      return rows.map((row) => JSON.parse(row.json) as Workspace);
    } catch (error) {
      console.error("[TauriSqlAdapter] Error fetching workspaces:", error);
      return [];
    }
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      const db = await this.getDb();
      const json = JSON.stringify(workspace);
      const now = Date.now();
      await db.execute(
        `INSERT INTO workspaces (id, json, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
        [workspace.id, json, now],
      );
    } catch (error) {
      console.error("[TauriSqlAdapter] Error saving workspace:", error);
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM workspaces WHERE id = $1;", [id]);
      await db.execute("DELETE FROM workspace_trees WHERE workspace_id = $1;", [
        id,
      ]);
    } catch (error) {
      console.error("[TauriSqlAdapter] Error deleting workspace:", error);
    }
  }

  // WORKSPACE TREE
  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ json: string }[]>(
        "SELECT json FROM workspace_trees WHERE workspace_id = $1;",
        [workspaceId],
      );
      if (rows.length === 0) return [];
      return JSON.parse(rows[0].json) as WorkspacePageMeta[];
    } catch (error) {
      console.error(
        `[TauriSqlAdapter] Error loading tree for workspace ${workspaceId}:`,
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
      const db = await this.getDb();
      const json = JSON.stringify(tree);
      const now = Date.now();
      await db.execute(
        `INSERT INTO workspace_trees (workspace_id, json, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(workspace_id) DO UPDATE SET json = $2, updated_at = $3;`,
        [workspaceId, json, now],
      );
    } catch (error) {
      console.error(
        `[TauriSqlAdapter] Error saving tree for workspace ${workspaceId}:`,
        error,
      );
    }
  }

  // DOCUMENT OPERATIONS
  async getDocument(id: string): Promise<DocumentJSON | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ json: string }[]>(
        "SELECT json FROM documents WHERE id = $1;",
        [id],
      );
      if (rows.length === 0) return null;
      return JSON.parse(rows[0].json) as DocumentJSON;
    } catch (error) {
      console.error(`[TauriSqlAdapter] Error loading document ${id}:`, error);
      return null;
    }
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    try {
      const db = await this.getDb();
      const json = JSON.stringify(doc);
      const now = Date.now();
      await db.execute(
        `INSERT INTO documents (id, json, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
        [doc.id, json, now],
      );
    } catch (error) {
      console.error(
        `[TauriSqlAdapter] Error saving document ${doc.id}:`,
        error,
      );
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM documents WHERE id = $1;", [id]);
      await this.deleteDocTags(id);
    } catch (error) {
      console.error(`[TauriSqlAdapter] Error deleting document ${id}:`, error);
    }
  }

  async getAllDocuments(): Promise<DocumentJSON[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ json: string }[]>(
        "SELECT json FROM documents ORDER BY updated_at DESC;",
      );
      return rows.map((r) => JSON.parse(r.json) as DocumentJSON);
    } catch (error) {
      console.error("[TauriSqlAdapter] Error fetching all documents:", error);
      return [];
    }
  }

  // TAG OPERATIONS
  async getTags(): Promise<Tag[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ json: string }[]>(
        "SELECT json FROM tags ORDER BY updated_at ASC;",
      );
      return rows.map((row) => JSON.parse(row.json) as Tag);
    } catch (error) {
      console.error("[TauriSqlAdapter] Error fetching tags:", error);
      return [];
    }
  }

  async saveTags(tags: Tag[]): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM tags;");
      const now = Date.now();

      for (const tag of tags) {
        await db.execute(
          `INSERT INTO tags (id, name, color, created_at, updated_at, json)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [tag.id, tag.name, tag.color, now, now, JSON.stringify(tag)],
        );
      }
    } catch (error) {
      console.error("[TauriSqlAdapter] Error saving tags:", error);
    }
  }

  // TAG INDEX OPERATIONS
  async saveDocTags(pageId: string, records: TagIndexRecord[]): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM block_tags WHERE page_id = $1;", [pageId]);

      if (records && records.length > 0) {
        for (const record of records) {
          await db.execute(
            `INSERT INTO block_tags (tag_id, page_id, block_id, block_type, snippet, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT(tag_id, page_id, block_id) DO UPDATE SET snippet = $5, updated_at = $6;`,
            [
              record.tagId,
              record.pageId,
              record.blockId,
              record.blockType,
              record.snippet || "",
              record.updatedAt,
            ],
          );
        }
      }
    } catch (error) {
      console.error(
        `[TauriSqlAdapter] Error saving tag index for page ${pageId}:`,
        error,
      );
    }
  }

  async deleteDocTags(pageId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM block_tags WHERE page_id = $1;", [pageId]);
    } catch (error) {
      console.error(
        `[TauriSqlAdapter] Error deleting tag index for page ${pageId}:`,
        error,
      );
    }
  }

  async getTagsIndex(tagId?: string): Promise<TagIndexRecord[]> {
    try {
      const db = await this.getDb();
      let query =
        "SELECT tag_id, page_id, block_id, block_type, snippet, updated_at FROM block_tags";
      const params: unknown[] = [];

      if (tagId) {
        query += " WHERE tag_id = $1";
        params.push(tagId);
      }

      query += " ORDER BY updated_at DESC;";

      const rows = await db.select<
        {
          tag_id: string;
          page_id: string;
          block_id: string;
          block_type: string;
          snippet: string;
          updated_at: number;
        }[]
      >(query, params);

      return rows.map((row) => ({
        tagId: row.tag_id,
        pageId: row.page_id,
        blockId: row.block_id,
        blockType: row.block_type as any,
        snippet: row.snippet,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error("[TauriSqlAdapter] Error fetching tag index:", error);
      return [];
    }
  }

  // BLOB OPERATIONS
  async getBlob(id: string): Promise<Blob | undefined> {
    try {
      const db = await this.getDb();
      const rows = await db.select<{ data: string; type: string }[]>(
        "SELECT data, type FROM blobs WHERE id = $1;",
        [id],
      );
      if (rows.length === 0) return undefined;
      const { data, type } = rows[0];
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: type || "" });
    } catch (error) {
      console.error(`[TauriSqlAdapter] Error loading blob ${id}:`, error);
      return undefined;
    }
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    try {
      const db = await this.getDb();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binaryString = "";

      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }

      const base64Data = btoa(binaryString);
      const now = Date.now();

      await db.execute(
        `INSERT INTO blobs (id, data, type, updated_at) VALUES ($1, $2, $3, $4)
         ON CONFLICT(id) DO UPDATE SET data = $2, type = $3, updated_at = $4;`,
        [id, base64Data, blob.type || "", now],
      );
    } catch (error) {
      console.error(`[TauriSqlAdapter] Error saving blob ${id}:`, error);
    }
  }

  async removeBlob(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM blobs WHERE id = $1;", [id]);
    } catch (error) {
      console.error(`[TauriSqlAdapter] Error removing blob ${id}:`, error);
    }
  }

  async getAllBlobs(): Promise<{ id: string; blob: Blob }[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<
        { id: string; data: string; type: string }[]
      >("SELECT id, data, type FROM blobs;");
      return rows.map((row) => {
        const binaryString = atob(row.data);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return {
          id: row.id,
          blob: new Blob([bytes], { type: row.type || "" }),
        };
      });
    } catch (error) {
      console.error("[TauriSqlAdapter] Error fetching all blobs:", error);
      return [];
    }
  }
}
