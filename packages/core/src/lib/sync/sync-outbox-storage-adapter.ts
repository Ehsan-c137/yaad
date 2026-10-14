import type { DocumentJSON, Tag } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";
import type { StorageAdapter, TagIndexRecord } from "../storage/types";
import { outboxQueue, type OutboxQueue } from "./outbox-queue";

/**
 * Decorator implementing StorageAdapter that intercepts writes and
 * enqueues mutations into the local Outbox for background server sync (ADR 0001).
 *
 * Local reads and writes remain 100% immediate and offline-first.
 */
export class SyncOutboxStorageAdapter implements StorageAdapter {
  private isApplyingRemote = false;

  constructor(
    private readonly inner: StorageAdapter,
    private readonly queue: OutboxQueue = outboxQueue,
  ) {}

  getInnerAdapter(): StorageAdapter {
    return this.inner;
  }

  /**
   * Executes a callback without enqueuing mutations to the outbox.
   * Used by SyncWorker when applying remote delta changes from the server.
   */
  async withRemoteContext<T>(fn: () => Promise<T>): Promise<T> {
    this.isApplyingRemote = true;
    try {
      return await fn();
    } finally {
      this.isApplyingRemote = false;
    }
  }

  async init(): Promise<void> {
    if (this.inner.init) {
      await this.inner.init();
    }
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return this.inner.getWorkspaces();
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    await this.inner.saveWorkspace(workspace);

    if (!this.isApplyingRemote) {
      await this.queue.enqueue({
        workspaceId: workspace.id,
        entityType: "workspace",
        entityId: workspace.id,
        operation: "upsert",
        payload: workspace,
      });
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.inner.deleteWorkspace(id);

    if (!this.isApplyingRemote) {
      await this.queue.enqueue({
        workspaceId: id,
        entityType: "workspace",
        entityId: id,
        operation: "delete",
        payload: { id },
      });
    }
  }

  // Workspace Tree
  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    return this.inner.getWorkspaceTree(workspaceId);
  }

  async saveWorkspaceTree(
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ): Promise<void> {
    await this.inner.saveWorkspaceTree(workspaceId, tree);

    if (!this.isApplyingRemote) {
      await this.queue.enqueue({
        workspaceId,
        entityType: "workspace_tree",
        entityId: workspaceId,
        operation: "upsert",
        payload: tree,
      });
    }
  }

  // Documents
  async getDocument(id: string): Promise<DocumentJSON | null> {
    return this.inner.getDocument(id);
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    await this.inner.saveDocument(doc);

    if (!this.isApplyingRemote) {
      await this.queue.enqueue({
        workspaceId: "ws_personal",
        entityType: "document",
        entityId: doc.id,
        operation: "upsert",
        payload: doc,
      });
    }
  }

  async deleteDocument(id: string): Promise<void> {
    await this.inner.deleteDocument(id);

    if (!this.isApplyingRemote) {
      await this.queue.enqueue({
        workspaceId: "ws_personal",
        entityType: "document",
        entityId: id,
        operation: "delete",
        payload: { id },
      });
    }
  }

  async getAllDocuments(): Promise<DocumentJSON[]> {
    if (this.inner.getAllDocuments) {
      return this.inner.getAllDocuments();
    }
    return [];
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    if (this.inner.getTags) {
      return this.inner.getTags();
    }
    return [];
  }

  async saveTags(tags: Tag[]): Promise<void> {
    if (this.inner.saveTags) {
      await this.inner.saveTags(tags);
    }
  }

  async saveDocTags(pageId: string, records: TagIndexRecord[]): Promise<void> {
    if (this.inner.saveDocTags) {
      await this.inner.saveDocTags(pageId, records);
    }
  }

  async deleteDocTags(pageId: string): Promise<void> {
    if (this.inner.deleteDocTags) {
      await this.inner.deleteDocTags(pageId);
    }
  }

  async getTagsIndex(tagId?: string): Promise<TagIndexRecord[]> {
    if (this.inner.getTagsIndex) {
      return this.inner.getTagsIndex(tagId);
    }
    return [];
  }

  // Blobs
  async getBlob(id: string): Promise<Blob | undefined> {
    return this.inner.getBlob(id);
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    return this.inner.saveBlob(id, blob);
  }

  async removeBlob(id: string): Promise<void> {
    return this.inner.removeBlob(id);
  }

  async getAllBlobs(): Promise<{ id: string; blob: Blob }[]> {
    if (this.inner.getAllBlobs) {
      return this.inner.getAllBlobs();
    }
    return [];
  }
}
