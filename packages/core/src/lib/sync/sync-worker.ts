import { useUserStore } from "@yaad/core/store/use-user-store";
import { syncService, type SyncService } from "@yaad/core/services/sync-service";
import type { StorageAdapter } from "../storage/types";
import { outboxQueue, type OutboxQueue } from "./outbox-queue";
import type { SyncOutboxAdapter } from "./sync-outbox-storage-adapter";
import type { ISyncWorker, SyncStatus } from "./types";

export interface SyncWorkerOptions {
  queue?: OutboxQueue;
  client?: SyncService;
  intervalMs?: number;
  onTreeUpdated?: (workspaceId: string) => Promise<void> | void;
}

export class SyncWorker implements ISyncWorker {
  private status: SyncStatus = "idle";
  private timer: any = null;
  private isSyncing = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private readonly queue: OutboxQueue;
  private readonly client: SyncService;
  private readonly intervalMs: number;
  private readonly onTreeUpdated?: (workspaceId: string) => Promise<void> | void;

  constructor(
    private readonly getAdapter: () => StorageAdapter,
    options: SyncWorkerOptions = {},
  ) {
    this.queue = options.queue ?? outboxQueue;
    this.client = options.client ?? syncService;
    this.intervalMs = options.intervalMs ?? 15000;
    this.onTreeUpdated = options.onTreeUpdated;
  }

  subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.listeners.forEach((fn) => fn(status));
    }
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  start(): void {
    if (this.timer) return;

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }

    this.timer = setInterval(() => {
      this.syncNow().catch((err) => {
        console.warn("[SyncWorker] Periodic sync failed:", err);
      });
    }, this.intervalMs);

    // Initial sync attempt
    this.syncNow().catch(() => {});
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }

    this.setStatus("idle");
  }

  private handleOnline = () => {
    this.syncNow().catch(() => {});
  };

  private handleOffline = () => {
    this.setStatus("offline");
  };

  /**
   * Performs an immediate two-step sync cycle: flush local outbox (Push), then fetch remote changes (Pull).
   */
  async syncNow(workspaceId = "ws_personal"): Promise<void> {
    const token = useUserStore.getState().token;
    if (!token) {
      // Unauthenticated / local guest mode: no server sync needed
      this.setStatus("idle");
      return;
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.onLine === false
    ) {
      this.setStatus("offline");
      return;
    }

    if (this.isSyncing) return;
    this.isSyncing = true;
    this.setStatus("syncing");

    try {
      await this.pushPendingMutations(workspaceId);
      await this.pullRemoteChanges(workspaceId);
      this.setStatus("idle");
    } catch (err: any) {
      console.warn("[SyncWorker] Sync error:", err);
      this.setStatus("error");
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushPendingMutations(workspaceId: string): Promise<void> {
    const pending = await this.queue.peek(50);
    if (!pending.length) return;

    // Filter mutations for target workspace
    const workspaceMutations = pending.filter(
      (item) => item.workspaceId === workspaceId,
    );
    if (!workspaceMutations.length) return;

    const clientId = this.queue.getClientId();
    const batch = workspaceMutations.map((item) => ({
      clientMutationId: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation,
      payload: item.payload,
      timestamp: item.timestamp,
    }));

    const result = await this.client.push(workspaceId, clientId, batch);
    if (result.acceptedMutationIds?.length) {
      await this.queue.dequeue(result.acceptedMutationIds);
    }

    if (typeof result.lastServerVersion === "number") {
      const currentKnown = await this.queue.getLastSyncedVersion(workspaceId);
      if (result.lastServerVersion > currentKnown) {
        await this.queue.setLastSyncedVersion(
          workspaceId,
          result.lastServerVersion,
        );
      }
    }
  }

  private async pullRemoteChanges(workspaceId: string): Promise<void> {
    const sinceVersion = await this.queue.getLastSyncedVersion(workspaceId);
    const result = await this.client.pull(workspaceId, sinceVersion);

    if (!result.changes || result.changes.length === 0) {
      return;
    }

    const adapter = this.getAdapter();
    const myClientId = this.queue.getClientId();

    const applyFn = async () => {
      let treeUpdated = false;

      for (const change of result.changes) {
        // Skip changes originated by this device
        if (change.clientMutationId && change.clientMutationId.startsWith(myClientId)) {
          continue;
        }

        if (change.entityType === "workspace_tree" && change.patch) {
          await adapter.saveWorkspaceTree(workspaceId, change.patch);
          treeUpdated = true;
        } else if (change.entityType === "document" && change.patch) {
          if (change.operation === "delete") {
            await adapter.deleteDocument(change.entityId);
          } else {
            await adapter.saveDocument(change.patch);
          }
        }
      }

      if (treeUpdated) {
        if (this.onTreeUpdated) {
          try {
            await this.onTreeUpdated(workspaceId);
          } catch {
            // Callback execution error caught
          }
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("yaad:sync:tree-updated", {
              detail: { workspaceId },
            }),
          );
        }
      }
    };

    // If adapter is SyncOutboxStorageAdapter, execute in remote context so changes don't re-enqueue
    if ("withRemoteContext" in adapter) {
      await (adapter as SyncOutboxAdapter).withRemoteContext(applyFn);
    } else {
      await applyFn();
    }

    if (typeof result.latestVersion === "number") {
      await this.queue.setLastSyncedVersion(workspaceId, result.latestVersion);
    }
  }
}
