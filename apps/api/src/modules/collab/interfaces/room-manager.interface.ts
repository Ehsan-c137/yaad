export interface IRoomManager {
  /**
   * Applies an incremental CRDT binary update to the room's document.
   */
  applyUpdate(
    workspaceId: string,
    documentId: string,
    update: Uint8Array,
  ): Promise<void>;

  /**
   * Returns missing binary updates for a client based on its state vector.
   */
  getDiffUpdate(
    workspaceId: string,
    documentId: string,
    clientStateVector?: Uint8Array,
  ): Promise<Uint8Array>;

  /**
   * Increments active consumer count and opens the room in RAM if needed.
   */
  acquireRoom(workspaceId: string, documentId: string): Promise<void>;

  /**
   * Decrements active consumer count. When count is 0, schedules snapshotting & eviction.
   */
  releaseRoom(workspaceId: string, documentId: string): void;
}
