import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollabGateway } from './collab.gateway.js';

describe('CollabGateway', () => {
  let gateway: CollabGateway;
  let mockRoomManager: any;

  beforeEach(() => {
    mockRoomManager = {
      acquireRoom: vi.fn().mockResolvedValue(undefined),
      releaseRoom: vi.fn(),
      applyUpdate: vi.fn().mockResolvedValue(undefined),
      getDiffUpdate: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };
    gateway = new CollabGateway(mockRoomManager);
  });

  it('handles client connection and joins room', async () => {
    const mockSocket: any = {
      send: vi.fn(),
      readyState: 1, // OPEN
    };

    gateway.handleConnection(mockSocket);

    await gateway.handleJoinRoom(mockSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
      stateVector: Buffer.from([0]).toString('base64'),
    });

    expect(mockRoomManager.acquireRoom).toHaveBeenCalledWith('ws_1', 'doc_1');
    expect(mockRoomManager.getDiffUpdate).toHaveBeenCalledWith(
      'ws_1',
      'doc_1',
      expect.any(Buffer),
    );
    expect(mockSocket.send).toHaveBeenCalledTimes(1);

    const sentMessage = JSON.parse(mockSocket.send.mock.calls[0][0]);
    expect(sentMessage.event).toBe('sync-step-2');
    expect(sentMessage.documentId).toBe('doc_1');
  });

  it('broadcasts sync-update to other room peers without echoing to sender', async () => {
    const senderSocket: any = { send: vi.fn(), readyState: 1 };
    const peerSocket: any = { send: vi.fn(), readyState: 1 };

    gateway.handleConnection(senderSocket);
    gateway.handleConnection(peerSocket);

    await gateway.handleJoinRoom(senderSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
    });
    await gateway.handleJoinRoom(peerSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
    });

    // Sender sends an update
    await gateway.handleSyncUpdate(senderSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
      update: Buffer.from([10, 20]).toString('base64'),
    });

    expect(mockRoomManager.applyUpdate).toHaveBeenCalledWith(
      'ws_1',
      'doc_1',
      expect.any(Buffer),
    );

    // Peer receives the update, sender does not
    expect(peerSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"sync-update"'),
    );
    // Sender should only have the initial sync-step-2 message, no echoed sync-update
    expect(senderSocket.send).toHaveBeenCalledTimes(1);
  });

  it('cleans up subscribers and releases room on client disconnect', async () => {
    const mockSocket: any = { send: vi.fn(), readyState: 1 };
    const peerSocket: any = { send: vi.fn(), readyState: 1 };

    gateway.handleConnection(mockSocket);
    gateway.handleConnection(peerSocket);

    await gateway.handleJoinRoom(mockSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
    });
    await gateway.handleJoinRoom(peerSocket, {
      workspaceId: 'ws_1',
      documentId: 'doc_1',
    });

    gateway.handleDisconnect(mockSocket);

    expect(mockRoomManager.releaseRoom).toHaveBeenCalledWith('ws_1', 'doc_1');
    expect(peerSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"peer-leave"'),
    );
  });
});
