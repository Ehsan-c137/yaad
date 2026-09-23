import type { StorageAdapter } from "./types";

import { LocalJsonAdapter } from "./local-json-adapter";
import { TauriSqlAdapter } from "./tauri-sql-adapter";

export type StorageMode = "local" | "remote" | "tauri-sql";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

export function getStorageAdapter(): StorageAdapter {
  if (isTauriEnvironment()) {
    return new TauriSqlAdapter();
  }

  return new LocalJsonAdapter();
}
