import type { SyncOutboxAdapter } from "../sync/sync-outbox-storage-adapter";
import type { StorageAdapter } from "./types";

import { createSyncOutboxAdapter } from "../sync/sync-outbox-storage-adapter";
import { SyncWorker } from "../sync/sync-worker";
import { getStorageAdapter } from "./storage-factory";

let enqueueDebounceTimer: any = null;

let rawAdapter: StorageAdapter = getStorageAdapter();
let currentAdapter: SyncOutboxAdapter = createSyncOutboxAdapter(rawAdapter, {
  onEnqueue: handleEnqueue,
});

export const syncWorker = new SyncWorker(() => currentAdapter, {
  onTreeUpdated: (workspaceId) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yaad:sync:tree-updated", {
          detail: { workspaceId },
        }),
      );
    }
  },
});

function handleEnqueue(workspaceId: string): void {
  if (enqueueDebounceTimer) clearTimeout(enqueueDebounceTimer);
  enqueueDebounceTimer = setTimeout(() => {
    void syncWorker.syncNow(workspaceId);
  }, 500);
}

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

  try {
    const { useCalendarStore } =
      await import("../../store/calendar/use-calendar-store");
    await useCalendarStore.getState().loadCalendarFromStorage();
  } catch (error) {
    console.warn(
      "[initStorage] Failed to initialize calendar from storage:",
      error,
    );
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
