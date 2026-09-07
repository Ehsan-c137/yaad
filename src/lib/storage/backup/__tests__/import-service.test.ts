import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationItem } from "@/store/inbox/use-inbox-store";
import type { TabItem } from "@/store/use-tab-store";
import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import { workspaceService } from "@/services/workspace-service";
import { useInboxStore } from "@/store/inbox/use-inbox-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import type { YaadExportPayload } from "../types";

import { importUserData } from "../import-service";

vi.mock("@/services/workspace-service", () => ({
  workspaceService: {
    getWorkspaces: vi.fn(),
    saveWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    getWorkspaceTree: vi.fn(),
    saveWorkspaceTree: vi.fn(),
  },
}));

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

const treeNode: WorkspacePageMeta = {
  id: "page_1",
  workspaceId: "ws_1",
  title: "P",
  parentId: null,
  childrenIds: [],
  updatedAt: 1,
};

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

const payload: YaadExportPayload = {
  app: "yaad",
  data: {
    blobs: [
      {
        id: "b1",
        mimeType: "text/plain",
        dataUrl: "data:text/plain;base64,aGVsbG8=",
      },
    ],
    documents: { page_1: doc },
    inbox: [notification],
    tabs: [tab],
    trees: { ws_1: [treeNode] },
    workspaces: [workspace],
  },
  exportedAt: 1,
  version: 1,
};

describe("importUserData (Integration Test)", () => {
  beforeEach(async () => {
    vi.mocked(workspaceService.getWorkspaces).mockResolvedValue([workspace]);
    vi.mocked(workspaceService.getWorkspaceTree).mockResolvedValue([]);
    idb.store.clear();
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
    useInboxStore.setState({
      notifications: [],
      filter: "all",
      _hasHydrated: true,
    });
    useTabStore.setState({ tabs: [], activeTabId: null, hasHydrated: true });
  });

  it("restores all data into storage and refreshes the stores", async () => {
    await importUserData(payload);

    expect(idb.store.get("app_workspaces_v1")).toEqual([workspace]);
    expect(idb.store.get("tree_ws_1")).toEqual([treeNode]);
    expect(idb.store.get("doc_page_1")).toEqual(doc);

    const restoredBlob = idb.store.get("blob_b1") as Blob;

    expect(restoredBlob.type).toBe("text/plain");
    await expect(restoredBlob.text()).resolves.toBe("hello");

    expect(useInboxStore.getState().notifications).toEqual([notification]);
    expect(useTabStore.getState().tabs).toEqual([tab]);
    expect(useTabStore.getState().activeTabId).toBe("tab_page_1");

    expect(useWorkspaceStore.getState().workspaces.ws_1).toMatchObject({
      id: "ws_1",
      name: "Personal",
    });
    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws_1");
  });
});
