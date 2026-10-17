import type { SyncOutboxAdapter } from "../sync/sync-outbox-storage-adapter";
import type { StorageAdapter } from "./types";

import { createSyncOutboxAdapter } from "../sync/sync-outbox-storage-adapter";
import { SyncWorker } from "../sync/sync-worker";
import { getStorageAdapter } from "./storage-factory";

let enqueueDebounceTimer: any = null;

function handleEnqueue(workspaceId: string) {
  if (enqueueDebounceTimer) clearTimeout(enqueueDebounceTimer);
  enqueueDebounceTimer = setTimeout(() => {
    void syncWorker.syncNow(workspaceId);
  }, 500);
}

let rawAdapter: StorageAdapter = getStorageAdapter();
let currentAdapter: SyncOutboxAdapter = createSyncOutboxAdapter(rawAdapter, {
  onEnqueue: handleEnqueue,
});

export const syncWorker = new SyncWorker(() => currentAdapter, {
  onTreeUpdated: async (workspaceId) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yaad:sync:tree-updated", {
          detail: { workspaceId },
        }),
      );
    }
  },
});

export function setStorageAdapter(adapter: StorageAdapter): void {
  rawAdapter = adapter;
  currentAdapter =
    "withRemoteContext" in adapter
      ? (adapter as SyncOutboxAdapter)
      : createSyncOutboxAdapter(adapter, { onEnqueue: handleEnqueue });
}

export function getCurrentStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

export async function initStorage(): Promise<void> {
  if (currentAdapter.init) {
    await currentAdapter.init();
  }

  // Start background sync worker
  syncWorker.start();
}

export const storage: StorageAdapter = new Proxy({} as StorageAdapter, {
  get(_target, prop: string | symbol) {
    const value = (currentAdapter as any)[prop];

    if (typeof value === "function") {
      return value.bind(currentAdapter);
    }

    return value;
  },
});
