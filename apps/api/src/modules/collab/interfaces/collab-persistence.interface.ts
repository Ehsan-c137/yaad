import type * as Y from 'yjs';

export interface ICollabPersistence {
  /**
   * Loads all stored CRDT binary delta updates for a document.
   */
  loadUpdates(workspaceId: string, documentId: string): Promise<Uint8Array[]>;

  /**
   * Loads the existing baseline JSON document if available.
   */
  loadBaselineJson(workspaceId: string, documentId: string): Promise<any>;

  /**
   * Persists an incremental binary update.
   */
  appendUpdate(
    workspaceId: string,
    documentId: string,
    update: Uint8Array,
  ): Promise<void>;

  /**
   * Materializes the in-memory Y.Doc state into canonical DocumentJSON.
   */
  materializeSnapshot(
    workspaceId: string,
    documentId: string,
    ydoc: Y.Doc,
  ): Promise<void>;
}
