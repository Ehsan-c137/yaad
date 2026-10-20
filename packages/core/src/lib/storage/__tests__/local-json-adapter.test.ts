import type { DocumentJSON } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocalJsonAdapter } from "../local-json-adapter";

const idb = vi.hoisted(() => {
  const store = new Map<string, unknown>();

  return {
    store,
    get: (key: string) => Promise.resolve(store.get(key)),
    set: (key: string, value: unknown) => {
      store.set(key, value);

      return Promise.resolve();
    },
    del: (key: string) => {
      store.delete(key);

      return Promise.resolve();
    },
    keys: () => Promise.resolve(Array.from(store.keys())),
  };
});

vi.mock("idb-keyval", () => idb);

const adapter = new LocalJsonAdapter();

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

const doc: DocumentJSON = {
  version: 1,
  id: "page_1",
  title: "P",
  rootBlockId: "root",
  createdAt: 1,
  updatedAt: 1,
  blocks: {},
};

describe("LocalJsonAdapter (Integration Test)", () => {
  beforeEach(() => {
    idb.store.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves, updates and lists workspaces under the app key", async () => {
    await adapter.saveWorkspace(workspace);

    expect(idb.store.get("app_workspaces_v1")).toEqual([workspace]);
    await expect(adapter.getWorkspaces()).resolves.toEqual([workspace]);

    await adapter.saveWorkspace({ ...workspace, name: "Renamed" });

    expect(idb.store.get("app_workspaces_v1")).toEqual([
      { ...workspace, name: "Renamed" },
    ]);
    await expect(adapter.getWorkspaces()).resolves.toHaveLength(1);
  });

  it("returns an empty workspace list when nothing is stored", async () => {
    await expect(adapter.getWorkspaces()).resolves.toEqual([]);
  });

  it("deletes a workspace together with its page tree", async () => {
    await adapter.saveWorkspace(workspace);
    await adapter.saveWorkspaceTree("ws_1", tree);

    await adapter.deleteWorkspace("ws_1");

    await expect(adapter.getWorkspaces()).resolves.toEqual([]);
    expect(idb.store.has("tree_ws_1")).toBe(false);
  });

  it("round-trips the workspace page tree", async () => {
    await adapter.saveWorkspaceTree("ws_1", tree);

    await expect(adapter.getWorkspaceTree("ws_1")).resolves.toEqual(tree);
  });

  it("returns an empty tree for unknown workspaces", async () => {
    await expect(adapter.getWorkspaceTree("ghost")).resolves.toEqual([]);
  });

  it("round-trips documents under the doc key prefix", async () => {
    await adapter.saveDocument(doc);

    expect(idb.store.has("doc_page_1")).toBe(true);
    await expect(adapter.getDocument("page_1")).resolves.toEqual(doc);

    await adapter.deleteDocument("page_1");

    await expect(adapter.getDocument("page_1")).resolves.toBeNull();
  });

  it("returns null for missing documents", async () => {
    await expect(adapter.getDocument("ghost")).resolves.toBeNull();
  });

  it("round-trips blobs under the blob key prefix", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });

    await adapter.saveBlob("b1", blob);

    expect(idb.store.has("blob_b1")).toBe(true);

    const restored = await adapter.getBlob("b1");

    expect(restored?.type).toBe("text/plain");
    await expect(restored?.text()).resolves.toBe("hello");

    await adapter.removeBlob("b1");

    await expect(adapter.getBlob("b1")).resolves.toBeUndefined();
  });

  it("logs and skips workspace writes when the stored value is corrupt", async () => {
    idb.store.set("app_workspaces_v1", "garbage");

    await adapter.saveWorkspace(workspace);

    expect(console.error).toHaveBeenCalledWith(
      "[LocalJsonAdapter] Error saving workspace:",
      expect.any(TypeError),
    );
    expect(idb.store.get("app_workspaces_v1")).toBe("garbage");
  });

  it("retrieves all documents with getAllDocuments", async () => {
    await adapter.saveDocument(doc);
    const all = await adapter.getAllDocuments();

    expect(all).toEqual([doc]);
  });

  it("saves and retrieves tags under app_tags_v1", async () => {
    const tag = { id: "tag_1", name: "Urgent", color: "red" as const };
    await adapter.saveTags([tag]);
    const tags = await adapter.getTags();

    expect(tags).toEqual([tag]);
    expect(idb.store.get("app_tags_v1")).toEqual([tag]);
  });

  it("retrieves all blobs with getAllBlobs", async () => {
    const blob = new Blob(["test blob"], { type: "text/plain" });
    await adapter.saveBlob("b1", blob);

    const allBlobs = await adapter.getAllBlobs();

    expect(allBlobs).toHaveLength(1);
    expect(allBlobs[0].id).toBe("b1");
  });

  it("saves, retrieves and deletes calendar events and categories in IndexedDB", async () => {
    const event = {
      id: "evt_1",
      title: "Team Sync",
      calendarId: "work" as const,
      date: "2026-10-20",
      startTime: "10:00",
      endTime: "11:00",
    };
    const category = {
      id: "work" as const,
      name: "Work",
      dotColor: "#3b82f6",
      badgeBg: "blue",
      badgeBorder: "blue",
      badgeText: "blue",
      badgeDarkBg: "darkblue",
      badgeDarkBorder: "darkblue",
      badgeDarkText: "blue",
      checked: true,
    };

    await adapter.saveCalendarCategory(category);
    expect(await adapter.getCalendarCategories()).toEqual([category]);

    await adapter.saveCalendarEvent(event);
    expect(await adapter.getCalendarEvents()).toEqual([event]);

    // Update event
    await adapter.saveCalendarEvent({ ...event, title: "Updated Team Sync" });
    const events = await adapter.getCalendarEvents();
    expect(events[0].title).toBe("Updated Team Sync");

    // Delete
    await adapter.deleteCalendarEvent("evt_1");
    expect(await adapter.getCalendarEvents()).toEqual([]);

    await adapter.deleteCalendarCategory("work");
    expect(await adapter.getCalendarCategories()).toEqual([]);
  });
});
