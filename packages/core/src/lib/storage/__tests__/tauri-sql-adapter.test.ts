import type { DocumentJSON } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseDriver } from "../tauri-sql-adapter";

import { TauriSqlAdapter } from "../tauri-sql-adapter";

class MockDatabaseDriver implements DatabaseDriver {
  public tables = new Map<
    string,
    Map<
      string,
      { json?: string; data?: string; type?: string; updated_at?: number }
    >
  >();

  constructor() {
    this.tables.set("workspaces", new Map());
    this.tables.set("workspace_trees", new Map());
    this.tables.set("documents", new Map());
    this.tables.set("blobs", new Map());
    this.tables.set("tags", new Map());
  }

  async execute(
    query: string,
    bindValues: unknown[] = [],
  ): Promise<{ rowsAffected: number }> {
    const q = query.trim();

    if (q.startsWith("CREATE TABLE") || q.startsWith("CREATE INDEX")) {
      return { rowsAffected: 0 };
    }

    if (q.startsWith("INSERT INTO workspaces")) {
      const [id, json, updatedAt] = bindValues as [string, string, number];
      this.tables.get("workspaces")!.set(id, { json, updated_at: updatedAt });
      return { rowsAffected: 1 };
    }

    if (q.startsWith("INSERT INTO workspace_trees")) {
      const [workspaceId, json, updatedAt] = bindValues as [
        string,
        string,
        number,
      ];
      this.tables
        .get("workspace_trees")!
        .set(workspaceId, { json, updated_at: updatedAt });
      return { rowsAffected: 1 };
    }

    if (q.startsWith("INSERT INTO documents")) {
      const [id, json, updatedAt] = bindValues as [string, string, number];
      this.tables.get("documents")!.set(id, { json, updated_at: updatedAt });
      return { rowsAffected: 1 };
    }

    if (q.startsWith("INSERT INTO blobs")) {
      const [id, data, type, updatedAt] = bindValues as [
        string,
        string,
        string,
        number,
      ];
      this.tables.get("blobs")!.set(id, { data, type, updated_at: updatedAt });
      return { rowsAffected: 1 };
    }

    if (q.startsWith("INSERT INTO tags")) {
      const [id, , , , , json] = bindValues as [
        string,
        string,
        string,
        number,
        number,
        string,
      ];
      this.tables.get("tags")!.set(id, { json });
      return { rowsAffected: 1 };
    }

    if (q.startsWith("DELETE FROM workspaces")) {
      const [id] = bindValues as [string];
      this.tables.get("workspaces")!.delete(id);
      return { rowsAffected: 1 };
    }

    if (q.startsWith("DELETE FROM workspace_trees")) {
      const [workspaceId] = bindValues as [string];
      this.tables.get("workspace_trees")!.delete(workspaceId);
      return { rowsAffected: 1 };
    }

    if (q.startsWith("DELETE FROM documents")) {
      const [id] = bindValues as [string];
      this.tables.get("documents")!.delete(id);
      return { rowsAffected: 1 };
    }

    if (q.startsWith("DELETE FROM blobs")) {
      const [id] = bindValues as [string];
      this.tables.get("blobs")!.delete(id);
      return { rowsAffected: 1 };
    }

    if (q.startsWith("DELETE FROM tags")) {
      this.tables.get("tags")!.clear();
      return { rowsAffected: 1 };
    }

    return { rowsAffected: 0 };
  }

  async select<T = unknown>(
    query: string,
    bindValues: unknown[] = [],
  ): Promise<T> {
    const q = query.trim();

    if (q.startsWith("SELECT json FROM workspaces")) {
      const rows = Array.from(this.tables.get("workspaces")!.values()).map(
        (row) => ({
          json: row.json!,
        }),
      );
      return rows as unknown as T;
    }

    if (q.startsWith("SELECT json FROM workspace_trees")) {
      const [workspaceId] = bindValues as [string];
      const row = this.tables.get("workspace_trees")!.get(workspaceId);
      return (row ? [{ json: row.json! }] : []) as unknown as T;
    }

    if (q.startsWith("SELECT json FROM documents WHERE")) {
      const [id] = bindValues as [string];
      const row = this.tables.get("documents")!.get(id);
      return (row ? [{ json: row.json! }] : []) as unknown as T;
    }

    if (q.startsWith("SELECT json FROM documents")) {
      const rows = Array.from(this.tables.get("documents")!.values()).map(
        (row) => ({
          json: row.json!,
        }),
      );
      return rows as unknown as T;
    }

    if (q.startsWith("SELECT data, type FROM blobs WHERE")) {
      const [id] = bindValues as [string];
      const row = this.tables.get("blobs")!.get(id);
      return (row
        ? [{ data: row.data!, type: row.type! }]
        : []) as unknown as T;
    }

    if (q.startsWith("SELECT id, data, type FROM blobs")) {
      const rows = Array.from(this.tables.get("blobs")!.entries()).map(
        ([id, val]) => ({
          id,
          data: val.data!,
          type: val.type!,
        }),
      );
      return rows as unknown as T;
    }

    if (q.startsWith("SELECT json FROM tags")) {
      const rows = Array.from(this.tables.get("tags")!.values()).map((row) => ({
        json: row.json!,
      }));
      return rows as unknown as T;
    }

    return [] as unknown as T;
  }
}

const workspace: Workspace = {
  id: "ws_sql_1",
  name: "SQL Workspace",
  icon: "💾",
  createdAt: 1,
  updatedAt: 1,
};

const tree: WorkspacePageMeta[] = [
  {
    id: "page_sql_1",
    workspaceId: "ws_sql_1",
    title: "SQL Page",
    parentId: null,
    childrenIds: [],
    updatedAt: 1,
  },
];

const doc: DocumentJSON = {
  version: 1,
  id: "page_sql_1",
  title: "SQL Page",
  rootBlockId: "root",
  createdAt: 1,
  updatedAt: 1,
  blocks: {},
};

describe("TauriSqlAdapter (Unit Test)", () => {
  let mockDriver: MockDatabaseDriver;
  let adapter: TauriSqlAdapter;

  beforeEach(async () => {
    mockDriver = new MockDatabaseDriver();
    adapter = new TauriSqlAdapter("sqlite:test.db", mockDriver);
    await adapter.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves, updates and reads workspaces", async () => {
    await adapter.saveWorkspace(workspace);
    const workspaces = await adapter.getWorkspaces();

    expect(workspaces).toEqual([workspace]);

    const updatedWorkspace = { ...workspace, name: "Updated SQL Workspace" };
    await adapter.saveWorkspace(updatedWorkspace);

    const reFetched = await adapter.getWorkspaces();

    expect(reFetched).toEqual([updatedWorkspace]);
  });

  it("deletes a workspace and its workspace tree", async () => {
    await adapter.saveWorkspace(workspace);
    await adapter.saveWorkspaceTree("ws_sql_1", tree);

    await adapter.deleteWorkspace("ws_sql_1");

    await expect(adapter.getWorkspaces()).resolves.toEqual([]);
    await expect(adapter.getWorkspaceTree("ws_sql_1")).resolves.toEqual([]);
  });

  it("saves and retrieves workspace trees", async () => {
    await adapter.saveWorkspaceTree("ws_sql_1", tree);
    const res = await adapter.getWorkspaceTree("ws_sql_1");

    expect(res).toEqual(tree);
  });

  it("saves, gets and deletes documents", async () => {
    await adapter.saveDocument(doc);
    const retrieved = await adapter.getDocument("page_sql_1");

    expect(retrieved).toEqual(doc);

    await adapter.deleteDocument("page_sql_1");

    await expect(adapter.getDocument("page_sql_1")).resolves.toBeNull();
  });

  it("retrieves all documents with getAllDocuments", async () => {
    await adapter.saveDocument(doc);
    const all = await adapter.getAllDocuments();

    expect(all).toEqual([doc]);
  });

  it("saves and retrieves tags", async () => {
    const tag = { id: "tag_1", name: "Urgent", color: "red" as const };
    await adapter.saveTags([tag]);
    const tags = await adapter.getTags();

    expect(tags).toEqual([tag]);
  });

  it("saves, gets and removes blobs", async () => {
    const blob = new Blob(["hello sql"], { type: "text/plain" });
    await adapter.saveBlob("b_sql_1", blob);

    const fetched = await adapter.getBlob("b_sql_1");

    expect(fetched).toBeDefined();
    expect(fetched?.type).toBe("text/plain");

    const text = await fetched?.text();

    expect(text).toBe("hello sql");

    const allBlobs = await adapter.getAllBlobs();

    expect(allBlobs).toHaveLength(1);
    expect(allBlobs[0].id).toBe("b_sql_1");

    await adapter.removeBlob("b_sql_1");

    await expect(adapter.getBlob("b_sql_1")).resolves.toBeUndefined();
  });
});
