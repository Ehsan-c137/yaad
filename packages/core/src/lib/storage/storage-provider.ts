import type { StorageAdapter } from "./types";

import { getStorageAdapter } from "./storage-factory";

let currentAdapter: StorageAdapter = getStorageAdapter();

export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter;
}

export function getCurrentStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

export async function initStorage(): Promise<void> {
  if (currentAdapter.init) {
    await currentAdapter.init();
  }
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
