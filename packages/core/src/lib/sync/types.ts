export type SyncEntityType =
  "document" | "page" | "tag" | "workspace_tree" | "workspace";

export type SyncOperation = "delete" | "upsert";

export interface OutboxItem {
  id: string; // clientMutationId
  workspaceId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: any;
  timestamp: number;
}

export type SyncStatus = "error" | "idle" | "offline" | "syncing";

export interface ISyncWorker {
  start: () => void;
  stop: () => void;
  syncNow: (workspaceId?: string) => Promise<void>;
  getStatus: () => SyncStatus;
}
