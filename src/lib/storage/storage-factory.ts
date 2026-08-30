import type { StorageAdapter } from "./types";

import { LocalJsonAdapter } from "./local-json-adapter";

export type StorageMode = "local" | "remote";

const STORAGE_MODE: StorageMode =
  (process.env.NEXT_PUBLIC_STORAGE_MODE as StorageMode) ?? "local";

export function getStorageAdapter(): StorageAdapter {
  switch (STORAGE_MODE) {
    case "local":
      return new LocalJsonAdapter();

    default:
      return new LocalJsonAdapter();
  }
}

export const storage = getStorageAdapter();
