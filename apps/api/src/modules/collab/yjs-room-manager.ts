import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as Y from 'yjs';
import { COLLAB_PERSISTENCE } from './collab.tokens.js';
import type { ICollabPersistence } from './interfaces/collab-persistence.interface.js';
import type { IRoomManager } from './interfaces/room-manager.interface.js';

export interface CollabRoom {
  workspaceId: string;
  documentId: string;
  ydoc: Y.Doc;
  activeConsumers: number;
  saveTimeout?: NodeJS.Timeout;
  evictionTimeout?: NodeJS.Timeout;
}

@Injectable()
export class YjsRoomManager implements IRoomManager, OnModuleDestroy {
  private readonly logger = new Logger(YjsRoomManager.name);
  private readonly rooms = new Map<string, CollabRoom>();

  // Snapshot debounce delay (10 seconds of idle typing)
  private readonly SNAPSHOT_DEBOUNCE_MS = 10_000;
  // Room in-memory cache time after all consumers disconnect (5 minutes)
  private readonly ROOM_EVICTION_MS = 5 * 60_000;

  constructor(
    @Inject(COLLAB_PERSISTENCE)
    private readonly persistence: ICollabPersistence,
  ) {}

  private getRoomKey(workspaceId: string, documentId: string): string {
    return `${workspaceId}:${documentId}`;
  }

  /**
   * Retrieves an existing active in-memory room, or loads and initializes it from persistence.
   */
  async getOrCreateRoom(
    workspaceId: string,
    documentId: string,
  ): Promise<CollabRoom> {
    const key = this.getRoomKey(workspaceId, documentId);
    let room = this.rooms.get(key);

    if (room) {
      if (room.evictionTimeout) {
        clearTimeout(room.evictionTimeout);
        room.evictionTimeout = undefined;
      }
      return room;
    }

    const ydoc = new Y.Doc();
    const storedUpdates = await this.persistence.loadUpdates(
      workspaceId,
      documentId,
    );

    if (storedUpdates.length > 0) {
      // Replay all persisted CRDT delta updates
      for (const update of storedUpdates) {
        Y.applyUpdate(ydoc, update);
      }
    } else {
      // Check if there is an existing baseline JSON document to initialize from
      const baselineJson = await this.persistence.loadBaselineJson(
        workspaceId,
        documentId,
      );
      if (baselineJson) {
        this.seedYDocFromJson(ydoc, baselineJson);
      }
    }

    room = {
      workspaceId,
      documentId,
      ydoc,
      activeConsumers: 0,
    };

    this.rooms.set(key, room);
    this.logger.log(`Room opened for doc ${documentId} (key: ${key})`);
    return room;
  }

  /**
   * Applies an incremental CRDT binary update to the room's document.
   */
  async applyUpdate(
    workspaceId: string,
    documentId: string,
    update: Uint8Array,
  ): Promise<void> {
    const room = await this.getOrCreateRoom(workspaceId, documentId);
    Y.applyUpdate(room.ydoc, update);

    // 1. Immediately persist incremental delta update
    await this.persistence.appendUpdate(workspaceId, documentId, update);

    // 2. Debounce snapshot materialization to PostgreSQL documents.content
    this.scheduleDebouncedSnapshot(room);
  }

  /**
   * Returns binary updates missing on the client given the client's state vector.
   */
  async getDiffUpdate(
    workspaceId: string,
    documentId: string,
    clientStateVector?: Uint8Array,
  ): Promise<Uint8Array> {
    const room = await this.getOrCreateRoom(workspaceId, documentId);
    if (clientStateVector && clientStateVector.length > 0) {
      return Y.encodeStateAsUpdate(room.ydoc, clientStateVector);
    }
    return Y.encodeStateAsUpdate(room.ydoc);
  }

  /**
   * Registers a consumer of this room (incrementing ref count).
   */
  async acquireRoom(workspaceId: string, documentId: string): Promise<void> {
    const room = await this.getOrCreateRoom(workspaceId, documentId);
    room.activeConsumers += 1;
  }

  /**
   * Releases a consumer of this room. Triggers snapshotting & RAM eviction when ref count hits 0.
   */
  releaseRoom(workspaceId: string, documentId: string): void {
    const key = this.getRoomKey(workspaceId, documentId);
    const room = this.rooms.get(key);
    if (!room) return;

    room.activeConsumers = Math.max(0, room.activeConsumers - 1);

    if (room.activeConsumers === 0) {
      // Materialize snapshot immediately on last consumer release
      void this.persistence.materializeSnapshot(
        workspaceId,
        documentId,
        room.ydoc,
      );

      // Schedule RAM eviction after idle period
      room.evictionTimeout = setTimeout(() => {
        this.rooms.delete(key);
        room.ydoc.destroy();
        this.logger.log(`Room evicted from memory: ${key}`);
      }, this.ROOM_EVICTION_MS);
    }
  }

  private scheduleDebouncedSnapshot(room: CollabRoom): void {
    if (room.saveTimeout) {
      clearTimeout(room.saveTimeout);
    }
    room.saveTimeout = setTimeout(() => {
      void this.persistence.materializeSnapshot(
        room.workspaceId,
        room.documentId,
        room.ydoc,
      );
      room.saveTimeout = undefined;
    }, this.SNAPSHOT_DEBOUNCE_MS);
  }

  /**
   * Seeds an empty Y.Doc from Yaad's standard DocumentJSON model.
   */
  private seedYDocFromJson(ydoc: Y.Doc, json: any): void {
    ydoc.transact(() => {
      const meta = ydoc.getMap('meta');
      if (json.title) meta.set('title', json.title);
      if (json.icon) meta.set('icon', json.icon);
      if (json.coverUrl) meta.set('coverUrl', json.coverUrl);

      const rootBlockIds = ydoc.getArray('rootBlockIds');
      if (Array.isArray(json.rootBlockIds)) {
        rootBlockIds.push(json.rootBlockIds);
      }

      const blocks = ydoc.getMap('blocks');
      if (json.blocks && typeof json.blocks === 'object') {
        for (const [blockId, blockData] of Object.entries(json.blocks)) {
          const blockMap = new Y.Map();
          for (const [propKey, propVal] of Object.entries(
            blockData as Record<string, any>,
          )) {
            blockMap.set(propKey, propVal);
          }
          blocks.set(blockId, blockMap);
        }
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    for (const room of this.rooms.values()) {
      if (room.saveTimeout) clearTimeout(room.saveTimeout);
      if (room.evictionTimeout) clearTimeout(room.evictionTimeout);
      await this.persistence.materializeSnapshot(
        room.workspaceId,
        room.documentId,
        room.ydoc,
      );
      room.ydoc.destroy();
    }
    this.rooms.clear();
  }
}
