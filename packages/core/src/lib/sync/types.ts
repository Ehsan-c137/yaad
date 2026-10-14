export type SyncEntityType =
  | "workspace"
  | "workspace_tree"
  | "page"
  | "document"
  | "tag";

export type SyncOperation = "upsert" | "delete";

export interface OutboxItem {
  id: string; // clientMutationId
  workspaceId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: any;
  timestamp: number;
}

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

export interface ISyncWorker {
  start(): void;
  stop(): void;
  syncNow(workspaceId?: string): Promise<void>;
  getStatus(): SyncStatus;
}
