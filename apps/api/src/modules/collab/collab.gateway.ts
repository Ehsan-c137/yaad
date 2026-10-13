import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { type Server, type WebSocket } from 'ws';
import { ROOM_MANAGER } from './collab.tokens.js';
import type { IRoomManager } from './interfaces/room-manager.interface.js';

interface ClientContext {
  workspaceId?: string;
  documentId?: string;
}

@WebSocketGateway({
  path: '/collab',
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CollabGateway.name);
  private readonly clientContexts = new WeakMap<WebSocket, ClientContext>();

  // Gateway manages its own WebSocket room subscribers (SRP & Law of Demeter compliant)
  private readonly roomSubscribers = new Map<string, Set<WebSocket>>();

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(ROOM_MANAGER)
    private readonly roomManager: IRoomManager,
  ) {}

  private getRoomKey(workspaceId: string, documentId: string): string {
    return `${workspaceId}:${documentId}`;
  }

  handleConnection(client: WebSocket): void {
    this.clientContexts.set(client, {});
    this.logger.debug('Collab client connected');
  }

  handleDisconnect(client: WebSocket): void {
    const ctx = this.clientContexts.get(client);
    if (ctx?.workspaceId && ctx?.documentId) {
      const roomKey = this.getRoomKey(ctx.workspaceId, ctx.documentId);
      const subscribers = this.roomSubscribers.get(roomKey);
      if (subscribers) {
        subscribers.delete(client);
        if (subscribers.size === 0) {
          this.roomSubscribers.delete(roomKey);
        }
      }

      // Notify RoomManager of consumer release
      this.roomManager.releaseRoom(ctx.workspaceId, ctx.documentId);

      // Broadcast peer leave to remaining room subscribers
      this.broadcastToRoom(
        ctx.workspaceId,
        ctx.documentId,
        {
          event: 'peer-leave',
          documentId: ctx.documentId,
        },
        client,
      );
    }

    this.clientContexts.delete(client);
    this.logger.debug('Collab client disconnected');
  }

  /**
   * Client joins a collaborative document room and initiates the two-step sync protocol.
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    data: {
      workspaceId: string;
      documentId: string;
      stateVector?: string; // Base64 encoded client state vector
    },
  ): Promise<void> {
    const { workspaceId, documentId, stateVector } = data;
    const roomKey = this.getRoomKey(workspaceId, documentId);

    const ctx = this.clientContexts.get(client) ?? {};
    ctx.workspaceId = workspaceId;
    ctx.documentId = documentId;
    this.clientContexts.set(client, ctx);

    // 1. Manage WebSocket subscriber registration in Gateway
    let subscribers = this.roomSubscribers.get(roomKey);
    if (!subscribers) {
      subscribers = new Set<WebSocket>();
      this.roomSubscribers.set(roomKey, subscribers);
    }
    subscribers.add(client);

    // 2. Acquire room in CRDT RoomManager
    await this.roomManager.acquireRoom(workspaceId, documentId);

    // 3. Decode client state vector if provided
    const clientVector = stateVector
      ? Buffer.from(stateVector, 'base64')
      : undefined;

    // 4. Calculate missing updates (Sync Step 2)
    const diffUpdate = await this.roomManager.getDiffUpdate(
      workspaceId,
      documentId,
      clientVector,
    );

    // 5. Send missing updates back to joining client
    client.send(
      JSON.stringify({
        event: 'sync-step-2',
        documentId,
        update: Buffer.from(diffUpdate).toString('base64'),
      }),
    );

    this.logger.debug(`Client joined room ${roomKey}`);
  }

  /**
   * Handles continuous incremental binary CRDT updates from a client.
   */
  @SubscribeMessage('sync-update')
  async handleSyncUpdate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    data: {
      workspaceId: string;
      documentId: string;
      update: string; // Base64 encoded binary Yjs delta
    },
  ): Promise<void> {
    const { workspaceId, documentId, update } = data;
    const binaryUpdate = Buffer.from(update, 'base64');

    // 1. Apply to CRDT engine and queue persistence
    await this.roomManager.applyUpdate(workspaceId, documentId, binaryUpdate);

    // 2. Broadcast the update to all OTHER collaborators in the room
    this.broadcastToRoom(
      workspaceId,
      documentId,
      {
        event: 'sync-update',
        documentId,
        update,
      },
      client,
    );
  }

  /**
   * Relays ephemeral presence / cursor awareness to all other clients in the room.
   */
  @SubscribeMessage('awareness-update')
  handleAwarenessUpdate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    data: {
      workspaceId: string;
      documentId: string;
      awarenessData: any; // Cursor coordinates, active block ID, user avatar/name
    },
  ): void {
    const { workspaceId, documentId, awarenessData } = data;

    this.broadcastToRoom(
      workspaceId,
      documentId,
      {
        event: 'awareness-update',
        documentId,
        awarenessData,
      },
      client,
    );
  }

  /**
   * Helper to broadcast a message to room subscribers directly from Gateway state.
   */
  private broadcastToRoom(
    workspaceId: string,
    documentId: string,
    message: Record<string, any>,
    excludeClient?: WebSocket,
  ): void {
    const roomKey = this.getRoomKey(workspaceId, documentId);
    const subscribers = this.roomSubscribers.get(roomKey);
    if (!subscribers) return;

    const payload = JSON.stringify(message);
    for (const peer of subscribers) {
      if (peer !== excludeClient && peer.readyState === 1) {
        peer.send(payload);
      }
    }
  }
}
