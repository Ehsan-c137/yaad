import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserStore } from "@yaad/core/store/use-user-store";
import type { StorageAdapter } from "../../storage/types";
import { OutboxQueue } from "../outbox-queue";
import { SyncWorker } from "../sync-worker";

describe("SyncWorker (Background Sync Engine)", () => {
  let queue: OutboxQueue;
  let mockAdapter: StorageAdapter;
  let mockSyncClient: any;
  let worker: SyncWorker;

  beforeEach(async () => {
    queue = new OutboxQueue();
    await queue.clear();

    mockAdapter = {
      getWorkspaces: vi.fn().mockResolvedValue([]),
      saveWorkspace: vi.fn().mockResolvedValue(undefined),
      deleteWorkspace: vi.fn().mockResolvedValue(undefined),
      getWorkspaceTree: vi.fn().mockResolvedValue([]),
      saveWorkspaceTree: vi.fn().mockResolvedValue(undefined),
      getDocument: vi.fn().mockResolvedValue(null),
      saveDocument: vi.fn().mockResolvedValue(undefined),
      deleteDocument: vi.fn().mockResolvedValue(undefined),
      getBlob: vi.fn().mockResolvedValue(undefined),
      saveBlob: vi.fn().mockResolvedValue(undefined),
      removeBlob: vi.fn().mockResolvedValue(undefined),
    };

    mockSyncClient = {
      push: vi.fn().mockResolvedValue({ acceptedMutationIds: [], lastServerVersion: 1 }),
      pull: vi.fn().mockResolvedValue({ changes: [], latestVersion: 1 }),
    };

    worker = new SyncWorker(() => mockAdapter, {
      queue,
      client: mockSyncClient,
      intervalMs: 60000,
    });
  });

  it("skips sync if user is not authenticated", async () => {
    useUserStore.setState({ token: null });

    await worker.syncNow("ws_1");
    expect(mockSyncClient.push).not.toHaveBeenCalled();
    expect(mockSyncClient.pull).not.toHaveBeenCalled();
    expect(worker.getStatus()).toBe("idle");
  });

  it("pushes queued mutations and dequeues accepted ones when authenticated", async () => {
    useUserStore.setState({ token: "valid-jwt-token" });

    const mut = await queue.enqueue({
      workspaceId: "ws_1",
      entityType: "document",
      entityId: "doc_1",
      operation: "upsert",
      payload: { title: "Test" },
    });

    mockSyncClient.push.mockResolvedValueOnce({
      acceptedMutationIds: [mut.id],
      lastServerVersion: 5,
    });

    await worker.syncNow("ws_1");

    expect(mockSyncClient.push).toHaveBeenCalledWith(
      "ws_1",
      queue.getClientId(),
      expect.arrayContaining([
        expect.objectContaining({
          clientMutationId: mut.id,
          entityType: "document",
          entityId: "doc_1",
        }),
      ]),
    );

    expect(await queue.size()).toBe(0);
    expect(await queue.getLastSyncedVersion("ws_1")).toBe(5);
  });

  it("pulls delta changes and applies them to local storage", async () => {
    useUserStore.setState({ token: "valid-jwt-token" });

    mockSyncClient.pull.mockResolvedValueOnce({
      changes: [
        {
          id: "log_1",
          workspaceId: "ws_1",
          version: 2,
          entityType: "workspace_tree",
          entityId: "ws_1",
          operation: "upsert",
          patch: [{ id: "p1", title: "Remote Page" }],
          clientMutationId: "other_client_1",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_2",
          workspaceId: "ws_1",
          version: 3,
          entityType: "document",
          entityId: "p1",
          operation: "upsert",
          patch: { id: "p1", title: "Remote Page Content" },
          clientMutationId: "other_client_2",
          createdAt: new Date().toISOString(),
        },
      ],
      latestVersion: 3,
    });

    await worker.syncNow("ws_1");

    expect(mockAdapter.saveWorkspaceTree).toHaveBeenCalledWith(
      "ws_1",
      expect.arrayContaining([expect.objectContaining({ id: "p1" })]),
    );
    expect(mockAdapter.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p1" }),
    );
    expect(await queue.getLastSyncedVersion("ws_1")).toBe(3);
  });

  it("calls onTreeUpdated and dispatches window event when workspace_tree is pulled", async () => {
    useUserStore.setState({ token: "valid-jwt-token" });
    const onTreeUpdated = vi.fn();
    const eventHandler = vi.fn();

    window.addEventListener("yaad:sync:tree-updated", eventHandler);

    const testWorker = new SyncWorker(() => mockAdapter, {
      queue,
      client: mockSyncClient,
      onTreeUpdated,
    });

    mockSyncClient.pull.mockResolvedValueOnce({
      changes: [
        {
          id: "log_1",
          workspaceId: "ws_1",
          version: 2,
          entityType: "workspace_tree",
          entityId: "ws_1",
          operation: "upsert",
          patch: [{ id: "p1", title: "Remote Page" }],
          clientMutationId: "other_client_1",
          createdAt: new Date().toISOString(),
        },
      ],
      latestVersion: 2,
    });

    await testWorker.syncNow("ws_1");

    expect(onTreeUpdated).toHaveBeenCalledWith("ws_1");
    expect(eventHandler).toHaveBeenCalled();

    window.removeEventListener("yaad:sync:tree-updated", eventHandler);
  });

  it("updates active in-memory document store when remote document changes are pulled", async () => {
    const { getDocumentStore, removeDocumentStore } = await import(
      "@yaad/core/store/document/use-document-store"
    );

    useUserStore.setState({ token: "valid-jwt-token" });
    const store = getDocumentStore("doc_open_1");
    store.setState({
      currentDocument: {
        version: 1,
        id: "doc_open_1",
        title: "Local Title",
        rootBlockId: "root",
        blocks: {},
        createdAt: 1000,
        updatedAt: 1000,
      },
    });

    const remoteDoc = {
      version: 2,
      id: "doc_open_1",
      title: "Remote Updated Title",
      rootBlockId: "root",
      blocks: {},
      createdAt: 1000,
      updatedAt: 2000,
    };

    mockSyncClient.pull.mockResolvedValueOnce({
      changes: [
        {
          id: "log_doc_1",
          workspaceId: "ws_1",
          version: 5,
          entityType: "document",
          entityId: "doc_open_1",
          operation: "upsert",
          patch: remoteDoc,
          clientMutationId: "other_peer",
          createdAt: new Date().toISOString(),
        },
      ],
      latestVersion: 5,
    });

    await worker.syncNow("ws_1");

    expect(store.getState().currentDocument?.title).toBe("Remote Updated Title");
    removeDocumentStore("doc_open_1", false);
  });
});
