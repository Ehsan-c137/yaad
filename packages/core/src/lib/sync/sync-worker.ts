import { useUserStore } from "../../store/use-user-store";
import { syncService, type SyncService } from "../../services/sync-service";
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

  private reconciledWorkspaces = new Set<string>();

  private async reconcileLocalTreeIfNeeded(workspaceId: string): Promise<void> {
    if (this.reconciledWorkspaces.has(workspaceId)) return;

    try {
      const adapter = this.getAdapter();
      const localTree = await adapter.getWorkspaceTree(workspaceId);
      if (localTree && localTree.length > 0) {
        const size = await this.queue.size();
        if (size === 0) {
          // Local has pages that may not have been pushed to the server yet.
          // Enqueue tree and document snapshots to ensure remote backup.
          await adapter.saveWorkspaceTree(workspaceId, localTree);
          for (const node of localTree) {
            const doc = await adapter.getDocument(node.id);
            if (doc) {
              await adapter.saveDocument(doc);
            }
          }
        }
      }
      this.reconciledWorkspaces.add(workspaceId);
    } catch (e) {
      console.warn("[SyncWorker] Error reconciling local tree:", e);
    }
  }

  /**
   * Performs an immediate two-step sync cycle: flush local outbox (Push), then fetch remote changes (Pull).
   */
  async syncNow(workspaceId?: string): Promise<void> {
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      try {
        const { useWorkspaceStore } = await import("../../store/use-workspace-store");
        targetWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId ?? "ws_personal";
      } catch {
        targetWorkspaceId = "ws_personal";
      }
    }

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
      await this.reconcileLocalTreeIfNeeded(targetWorkspaceId);
      await this.pushPendingMutations();
      await this.pullRemoteChanges(targetWorkspaceId);
      this.setStatus("idle");
    } catch (err: any) {
      console.warn("[SyncWorker] Sync error:", err);
      this.setStatus("error");
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushPendingMutations(): Promise<void> {
    const pending = await this.queue.peek(100);
    if (!pending.length) return;

    // Group mutations by workspaceId to avoid head-of-line blocking
    const byWorkspace = new Map<string, typeof pending>();
    for (const item of pending) {
      const list = byWorkspace.get(item.workspaceId) ?? [];
      list.push(item);
      byWorkspace.set(item.workspaceId, list);
    }

    const clientId = this.queue.getClientId();

    for (const [wsId, mutations] of byWorkspace.entries()) {
      const batch = mutations.map((item) => ({
        clientMutationId: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
        timestamp: item.timestamp,
      }));

      try {
        const result = await this.client.push(wsId, clientId, batch);
        if (result.acceptedMutationIds?.length) {
          await this.queue.dequeue(result.acceptedMutationIds);
        }

        if (typeof result.lastServerVersion === "number") {
          const currentKnown = await this.queue.getLastSyncedVersion(wsId);
          if (result.lastServerVersion > currentKnown) {
            await this.queue.setLastSyncedVersion(
              wsId,
              result.lastServerVersion,
            );
          }
        }
      } catch (err) {
        console.warn(`[SyncWorker] Push failed for workspace ${wsId}:`, err);
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
          if (typeof BroadcastChannel !== "undefined") {
            try {
              const channel = new BroadcastChannel("yaad-sync-channel");
              channel.postMessage({ type: "tree-updated", workspaceId });
              channel.close();
            } catch {}
          }
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
