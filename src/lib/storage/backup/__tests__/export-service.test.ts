import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationItem } from "@/store/inbox/use-inbox-store";
import type { TabItem } from "@/store/use-tab-store";
import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import { useInboxStore } from "@/store/inbox/use-inbox-store";
import { useTabStore } from "@/store/use-tab-store";

import { exportUserData } from "../export-service";

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

const notification: NotificationItem = {
  id: "notif_1",
  title: "Hello",
  description: "World",
  type: "mention",
  read: false,
  createdAt: 1,
};

const tab: TabItem = {
  id: "tab_page_1",
  pageId: "page_1",
  workspaceId: "ws_1",
  title: "P",
  isPinned: false,
  lastAccessedAt: 1,
};

describe("exportUserData (Integration Test)", () => {
  beforeEach(() => {
    idb.store.clear();
    localStorage.clear();
    useInboxStore.setState({
      notifications: [notification],
      filter: "all",
      _hasHydrated: true,
    });
    useTabStore.setState({
      tabs: [tab],
      activeTabId: tab.id,
      hasHydrated: true,
    });
  });

  it("packages workspaces, trees, documents, blobs, inbox and tabs", async () => {
    idb.store.set("app_workspaces_v1", [workspace]);
    idb.store.set("tree_ws_1", tree);
    idb.store.set("doc_page_1", doc);
    idb.store.set("blob_b1", new Blob(["hi"], { type: "text/plain" }));
    idb.store.set("unrelated", "ignored");

    const payload = await exportUserData();

    expect(payload.app).toBe("yaad");
    expect(payload.version).toBe(1);
    expect(typeof payload.exportedAt).toBe("number");
    expect(payload.data.workspaces).toEqual([workspace]);
    expect(payload.data.trees).toEqual({ ws_1: tree });
    expect(payload.data.documents).toEqual({ page_1: doc });
    expect(payload.data.inbox).toEqual([notification]);
    expect(payload.data.tabs).toEqual([tab]);

    expect(payload.data.blobs).toHaveLength(1);

    const blob = payload.data.blobs[0];

    expect(blob.id).toBe("b1");
    expect(blob.mimeType).toBe("text/plain");
    expect(blob.dataUrl).toMatch(/^data:text\/plain;base64,/);
  });

  it("produces empty collections when storage is blank", async () => {
    useInboxStore.setState({ notifications: [], _hasHydrated: true });
    useTabStore.setState({ tabs: [], activeTabId: null, hasHydrated: true });

    const payload = await exportUserData();

    expect(payload.data.workspaces).toEqual([]);
    expect(payload.data.trees).toEqual({});
    expect(payload.data.documents).toEqual({});
    expect(payload.data.blobs).toEqual([]);
    expect(payload.data.inbox).toEqual([]);
    expect(payload.data.tabs).toEqual([]);
  });
});
