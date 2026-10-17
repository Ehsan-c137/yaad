import { getDefaultApiBaseUrl } from "../constants/endpoints.js";
import { useUserStore } from "../store/use-user-store";

export interface SyncMutation {
  clientMutationId: string;
  entityType: "document" | "page" | "tag" | "workspace_tree" | "workspace";
  entityId: string;
  operation: "delete" | "upsert";
  payload: any;
}

export interface PushResult {
  acceptedMutationIds: string[];
  lastServerVersion: number;
}

export interface PullResult {
  changes: {
    id: string;
    version: number;
    entityType: string;
    entityId: string;
    operation: string;
    patch: any;
    clientMutationId: string | null;
    createdAt: string;
  }[];
  latestVersion: number;
  hasMore: boolean;
}

export class SyncService {
  private readonly baseUrl: string;

  constructor(baseUrl = getDefaultApiBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const { token } = useUserStore.getState();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async push(
    workspaceId: string,
    clientId: string,
    mutations: SyncMutation[],
  ): Promise<PushResult> {
    const res = await fetch(`${this.baseUrl}/sync/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({
        workspaceId,
        clientId,
        mutations,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Push sync failed");
    }

    return res.json();
  }

  async pull(
    workspaceId: string,
    sinceVersion = 0,
    limit = 500,
  ): Promise<PullResult> {
    const res = await fetch(`${this.baseUrl}/sync/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({
        workspaceId,
        sinceVersion,
        limit,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Pull sync failed");
    }

    return res.json();
  }
}

export const syncService = new SyncService();
