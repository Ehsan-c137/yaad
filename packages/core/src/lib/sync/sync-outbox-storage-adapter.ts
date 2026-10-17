import type { StorageAdapter } from "../storage/types";
import type { OutboxQueue } from "./outbox-queue";
import type { SyncEntityType, SyncOperation } from "./types";

import { outboxQueue } from "./outbox-queue";

export interface SyncOutboxAdapterOptions {
  queue?: OutboxQueue;
  onEnqueue?: (workspaceId: string) => void;
}

export interface SyncOutboxAdapter extends StorageAdapter {
  withRemoteContext: <T>(fn: () => Promise<T>) => Promise<T>;
  getInnerAdapter: () => StorageAdapter;
}

/**
 * Functional Proxy decorator creating a storage adapter that transparently enqueues
 * local mutations into the Outbox for background server synchronization (ADR 0001).
 *
 * Local reads and writes remain 100% immediate, zero-latency, and offline-capable.
 * Supports both class instances (with prototype methods) and plain objects.
 */
export function createSyncOutboxAdapter(
  inner: StorageAdapter,
  options: SyncOutboxAdapterOptions = {},
): SyncOutboxAdapter {
  const queue = options.queue ?? outboxQueue;
  let isApplyingRemote = false;

  const withRemoteContext = async <T>(fn: () => Promise<T>): Promise<T> => {
    isApplyingRemote = true;

    try {
      return await fn();
    } finally {
      isApplyingRemote = false;
    }
  };

  const enqueue = async (
    workspaceId: string,
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload: any,
  ): Promise<void> => {
    if (isApplyingRemote) return;
    await queue.enqueue({
      workspaceId,
      entityType,
      entityId,
      operation,
      payload,
    });
    options.onEnqueue?.(workspaceId);
  };

  const overrides: Record<string | symbol, any> = {
    getInnerAdapter: () => inner,
    withRemoteContext,

    saveWorkspace: async (workspace: any) => {
      await inner.saveWorkspace(workspace);
      await enqueue(
        workspace.id,
        "workspace",
        workspace.id,
        "upsert",
        workspace,
      );
    },

    deleteWorkspace: async (id: string) => {
      await inner.deleteWorkspace(id);
      await enqueue(id, "workspace", id, "delete", { id });
    },

    saveWorkspaceTree: async (workspaceId: string, tree: any) => {
      await inner.saveWorkspaceTree(workspaceId, tree);
      await enqueue(workspaceId, "workspace_tree", workspaceId, "upsert", tree);
    },

    saveDocument: async (doc: any) => {
      await inner.saveDocument(doc);
      let wsId = "ws_personal";

      try {
        const { useWorkspaceStore } =
          await import("../../store/use-workspace-store");
        wsId = useWorkspaceStore.getState().activeWorkspaceId ?? "ws_personal";
      } catch {}

      await enqueue(wsId, "document", doc.id, "upsert", doc);
    },

    deleteDocument: async (id: string) => {
      await inner.deleteDocument(id);
      let wsId = "ws_personal";

      try {
        const { useWorkspaceStore } =
          await import("../../store/use-workspace-store");
        wsId = useWorkspaceStore.getState().activeWorkspaceId ?? "ws_personal";
      } catch {}

      await enqueue(wsId, "document", id, "delete", { id });
    },
  };

  return new Proxy(inner as SyncOutboxAdapter, {
    get(target, prop, receiver) {
      if (prop in overrides) {
        return overrides[prop];
      }

      const val = Reflect.get(target, prop, receiver);

      if (typeof val === "function") {
        return val.bind(target);
      }

      return val;
    },
  });
}

// Backward-compatible alias for type compatibility
export type SyncOutboxStorageAdapter = SyncOutboxAdapter;
