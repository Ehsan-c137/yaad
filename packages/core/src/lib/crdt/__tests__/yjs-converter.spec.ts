import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import type { DocumentJSON } from '../../../types/document';
import { CollabClient } from '../collab-client';
import { documentJsonToYDoc, yDocToDocumentJson } from '../yjs-converter';

describe('CRDT Yjs Converter', () => {
  const sampleDoc: DocumentJSON = {
    id: 'page_1',
    version: 1,
    title: 'Collaborative Page',
    icon: '📝',
    rootBlockId: 'blk_root',
    createdAt: 1000,
    updatedAt: 2000,
    blocks: {
      blk_1: {
        id: 'blk_1',
        type: 'paragraph',
        parentId: null,
        childrenIds: [],
        properties: { text: 'Hello from client A' },
        createdAt: 1000,
        updatedAt: 2000,
      },
      blk_2: {
        id: 'blk_2',
        type: 'todo',
        parentId: null,
        childrenIds: [],
        properties: { text: 'Buy milk', checked: false },
        createdAt: 1000,
        updatedAt: 2000,
      },
    },
  };

  it('converts DocumentJSON to Y.Doc preserving hierarchy and properties', () => {
    const ydoc = documentJsonToYDoc(sampleDoc);

    const meta = ydoc.getMap('meta');
    expect(meta.get('title')).toBe('Collaborative Page');
    expect(meta.get('icon')).toBe('📝');

    const blocks = ydoc.getMap('blocks');
    const blk1 = blocks.get('blk_1') as Y.Map<any>;
    expect(blk1.get('type')).toBe('paragraph');
    expect(blk1.get('properties')).toEqual({ text: 'Hello from client A' });

    const blk2 = blocks.get('blk_2') as Y.Map<any>;
    expect(blk2.get('type')).toBe('todo');
    expect(blk2.get('properties')).toEqual({ text: 'Buy milk', checked: false });
  });

  it('converts Y.Doc back to DocumentJSON losslessly', () => {
    const ydoc = documentJsonToYDoc(sampleDoc);
    const roundtrip = yDocToDocumentJson(ydoc);

    expect(roundtrip.id).toBe(sampleDoc.id);
    expect(roundtrip.title).toBe(sampleDoc.title);
    expect(roundtrip.icon).toBe(sampleDoc.icon);
    expect(roundtrip.blocks.blk_1.properties).toEqual(sampleDoc.blocks.blk_1.properties);
    expect(roundtrip.blocks.blk_2.properties).toEqual(sampleDoc.blocks.blk_2.properties);
  });
});

describe('CollabClient', () => {
  it('connects, initiates sync-step-1, and handles sync-update', () => {
    const ydoc = new Y.Doc();
    const mockSend = vi.fn();
    let onOpenCallback: any;
    let onMessageCallback: any;

    class MockWebSocket {
      readyState = 1;
      send = mockSend;
      close = vi.fn();
      set onopen(cb: any) {
        onOpenCallback = cb;
      }
      set onmessage(cb: any) {
        onMessageCallback = cb;
      }
    }

    const client = new CollabClient({
      serverUrl: 'ws://mock/collab',
      workspaceId: 'ws_test',
      documentId: 'doc_test',
      ydoc,
      WebSocketClass: MockWebSocket as any,
    });

    client.connect();
    // Simulate open
    onOpenCallback();

    // Verify join-room message was sent
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining('"event":"join-room"'),
    );

    // Simulate incoming server update
    const serverDoc = new Y.Doc();
    serverDoc.getText('text').insert(0, 'Server Content');
    const serverUpdate = Buffer.from(Y.encodeStateAsUpdate(serverDoc)).toString('base64');

    onMessageCallback({
      data: JSON.stringify({
        event: 'sync-update',
        update: serverUpdate,
      }),
    });

    // Check that ydoc received the update
    expect(ydoc.getText('text').toString()).toBe('Server Content');

    client.disconnect();
  });
});
