import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';

import { YjsRoomManager } from './yjs-room-manager.js';

describe('YjsRoomManager', () => {
  let roomManager: YjsRoomManager;
  let mockPersistence: any;

  beforeEach(() => {
    mockPersistence = {
      loadUpdates: vi.fn().mockResolvedValue([]),
      loadBaselineJson: vi.fn().mockResolvedValue(null),
      appendUpdate: vi.fn().mockResolvedValue(undefined),
      materializeSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    roomManager = new YjsRoomManager(mockPersistence);
  });

  it('creates and caches in-memory rooms', async () => {
    const room1 = await roomManager.getOrCreateRoom('ws_1', 'doc_1');
    const room2 = await roomManager.getOrCreateRoom('ws_1', 'doc_1');

    expect(room1).toBe(room2);
    expect(mockPersistence.loadUpdates).toHaveBeenCalledTimes(1);
  });

  it('seeds Y.Doc from baseline JSON if no updates exist', async () => {
    mockPersistence.loadBaselineJson.mockResolvedValue({
      id: 'doc_1',
      title: 'Initial Title',
      rootBlockIds: ['blk_1', 'blk_2'],
      blocks: {
        blk_1: {
          id: 'blk_1',
          type: 'paragraph',
          properties: { text: 'Hello' },
        },
      },
    });

    const room = await roomManager.getOrCreateRoom('ws_1', 'doc_1');
    const meta = room.ydoc.getMap('meta');
    const rootBlockIds = room.ydoc.getArray('rootBlockIds');
    const blocks = room.ydoc.getMap('blocks');

    expect(meta.get('title')).toBe('Initial Title');
    expect(rootBlockIds.toArray()).toEqual(['blk_1', 'blk_2']);
    expect((blocks.get('blk_1') as Y.Map<any>)?.get('type')).toBe('paragraph');
  });

  it('applies client updates and persists deltas', async () => {
    const clientDoc = new Y.Doc();
    clientDoc.getText('test_text').insert(0, 'Collaborative Edit');
    const update = Y.encodeStateAsUpdate(clientDoc);

    await roomManager.applyUpdate('ws_1', 'doc_1', update);

    const room = await roomManager.getOrCreateRoom('ws_1', 'doc_1');
    expect(room.ydoc.getText('test_text').toString()).toBe(
      'Collaborative Edit',
    );
    expect(mockPersistence.appendUpdate).toHaveBeenCalledWith(
      'ws_1',
      'doc_1',
      update,
    );
  });

  it('converges concurrent updates from multiple clients deterministically without conflicts', async () => {
    // Client A types at offset 0
    const clientADoc = new Y.Doc();
    clientADoc.getText('content').insert(0, 'AAA');
    const updateA = Y.encodeStateAsUpdate(clientADoc);

    // Client B types at offset 0 concurrently
    const clientBDoc = new Y.Doc();
    clientBDoc.getText('content').insert(0, 'BBB');
    const updateB = Y.encodeStateAsUpdate(clientBDoc);

    // Server receives both updates in any order
    await roomManager.applyUpdate('ws_1', 'doc_1', updateA);
    await roomManager.applyUpdate('ws_1', 'doc_1', updateB);

    const serverRoom = await roomManager.getOrCreateRoom('ws_1', 'doc_1');
    const serverResult = serverRoom.ydoc.getText('content').toString();

    // Client A applies update B
    Y.applyUpdate(clientADoc, updateB);
    // Client B applies update A
    Y.applyUpdate(clientBDoc, updateA);

    // Mathematically proven: all converge to the exact same text!
    expect(clientADoc.getText('content').toString()).toBe(serverResult);
    expect(clientBDoc.getText('content').toString()).toBe(serverResult);
  });

  it('computes differential updates for clients using state vector (Sync Step 2)', async () => {
    // 1. Initial state on server
    const serverSeed = new Y.Doc();
    serverSeed.getText('notes').insert(0, 'Initial');
    await roomManager.applyUpdate(
      'ws_1',
      'doc_1',
      Y.encodeStateAsUpdate(serverSeed),
    );

    // 2. Client is synced up to 'Initial'
    const clientDoc = new Y.Doc();
    Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverSeed));
    const clientVector = Y.encodeStateVector(clientDoc);

    // 3. Server receives a new edit while client was not looking
    const serverEdit = new Y.Doc();
    Y.applyUpdate(serverEdit, Y.encodeStateAsUpdate(serverSeed));
    serverEdit.getText('notes').insert(7, ' World');
    await roomManager.applyUpdate(
      'ws_1',
      'doc_1',
      Y.encodeStateAsUpdate(serverEdit, clientVector),
    );

    // 4. Client asks for missing diff with its state vector
    const diff = await roomManager.getDiffUpdate('ws_1', 'doc_1', clientVector);

    // 5. Applying the diff to client brings client to 'Initial World'
    Y.applyUpdate(clientDoc, diff);
    expect(clientDoc.getText('notes').toString()).toBe('Initial World');
  });

  it('manages consumer lifecycle via acquireRoom and releaseRoom', async () => {
    await roomManager.acquireRoom('ws_1', 'doc_1');
    const room = await roomManager.getOrCreateRoom('ws_1', 'doc_1');
    expect(room.activeConsumers).toBe(1);

    roomManager.releaseRoom('ws_1', 'doc_1');
    expect(room.activeConsumers).toBe(0);
    // Should immediately trigger snapshot materialization upon last release
    expect(mockPersistence.materializeSnapshot).toHaveBeenCalledWith(
      'ws_1',
      'doc_1',
      room.ydoc,
    );
  });
});
