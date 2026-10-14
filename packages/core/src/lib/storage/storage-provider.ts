import type { StorageAdapter } from "./types";

import { getStorageAdapter } from "./storage-factory";
import { SyncOutboxStorageAdapter } from "../sync/sync-outbox-storage-adapter";
import { SyncWorker } from "../sync/sync-worker";

let rawAdapter: StorageAdapter = getStorageAdapter();
let currentAdapter: StorageAdapter = new SyncOutboxStorageAdapter(rawAdapter);

export const syncWorker = new SyncWorker(() => currentAdapter);

export function setStorageAdapter(adapter: StorageAdapter): void {
  rawAdapter = adapter;
  currentAdapter =
    adapter instanceof SyncOutboxStorageAdapter
      ? adapter
      : new SyncOutboxStorageAdapter(adapter);
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
