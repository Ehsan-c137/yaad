import { del, get, set } from "idb-keyval";
import type { OutboxItem } from "./types";

const OUTBOX_KEY = "yaad_sync_outbox_queue_v1";
const SYNC_VERSION_PREFIX = "yaad_sync_version_";
const CLIENT_ID_KEY = "yaad_sync_client_id_v1";

export class OutboxQueue {
  private inMemoryQueue: OutboxItem[] = [];
  private inMemoryVersions: Map<string, number> = new Map();
  private clientId: string | null = null;

  constructor() {
    this.initClientId();
  }

  private initClientId(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        let id = window.localStorage.getItem(CLIENT_ID_KEY);
        if (!id) {
          id = `client_${crypto.randomUUID()}`;
          window.localStorage.setItem(CLIENT_ID_KEY, id);
        }
        this.clientId = id;
      } catch {
        this.clientId = `client_${crypto.randomUUID()}`;
      }
    } else {
      this.clientId = `client_${crypto.randomUUID()}`;
    }
  }

  getClientId(): string {
    if (!this.clientId) {
      this.initClientId();
    }
    return this.clientId ?? "client_default";
  }

  async enqueue(
    item: Omit<OutboxItem, "id" | "timestamp"> & {
      id?: string;
      timestamp?: number;
    },
  ): Promise<OutboxItem> {
    const fullItem: OutboxItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      timestamp: item.timestamp || Date.now(),
    };

    try {
      const queue = await this.readQueue();
      queue.push(fullItem);
      await set(OUTBOX_KEY, queue);
      this.inMemoryQueue = queue;
    } catch {
      this.inMemoryQueue.push(fullItem);
    }

    return fullItem;
  }

  async peek(limit = 50): Promise<OutboxItem[]> {
    try {
      const queue = await this.readQueue();
      return queue.slice(0, limit);
    } catch {
      return this.inMemoryQueue.slice(0, limit);
    }
  }

  async dequeue(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const idSet = new Set(ids);

    try {
      const queue = await this.readQueue();
      const filtered = queue.filter((item) => !idSet.has(item.id));
      await set(OUTBOX_KEY, filtered);
      this.inMemoryQueue = filtered;
    } catch {
      this.inMemoryQueue = this.inMemoryQueue.filter(
        (item) => !idSet.has(item.id),
      );
    }
  }

  async size(): Promise<number> {
    try {
      const queue = await this.readQueue();
      return queue.length;
    } catch {
      return this.inMemoryQueue.length;
    }
  }

  async clear(): Promise<void> {
    try {
      await del(OUTBOX_KEY);
      this.inMemoryQueue = [];
    } catch {
      this.inMemoryQueue = [];
    }
  }

  async getLastSyncedVersion(workspaceId: string): Promise<number> {
    const key = `${SYNC_VERSION_PREFIX}${workspaceId}`;
    try {
      const version = await get<number>(key);
      if (typeof version === "number") return version;
      return this.inMemoryVersions.get(workspaceId) ?? 0;
    } catch {
      return this.inMemoryVersions.get(workspaceId) ?? 0;
    }
  }

  async setLastSyncedVersion(
    workspaceId: string,
    version: number,
  ): Promise<void> {
    const key = `${SYNC_VERSION_PREFIX}${workspaceId}`;
    this.inMemoryVersions.set(workspaceId, version);
    try {
      await set(key, version);
    } catch {
      // In-memory version preserved
    }
  }

  private async readQueue(): Promise<OutboxItem[]> {
    const stored = await get<OutboxItem[]>(OUTBOX_KEY);
    if (!stored || !Array.isArray(stored)) {
      return this.inMemoryQueue;
    }
    this.inMemoryQueue = stored;
    return stored;
  }
}

export const outboxQueue = new OutboxQueue();
