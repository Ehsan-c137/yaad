import { Logger } from '@nestjs/common';
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
import { YjsRoomManager } from './yjs-room-manager.js';

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

  @WebSocketServer()
  server!: Server;

  constructor(private readonly roomManager: YjsRoomManager) {}

  handleConnection(client: WebSocket): void {
    this.clientContexts.set(client, {});
    this.logger.debug('Collab client connected');
  }

  handleDisconnect(client: WebSocket): void {
    const ctx = this.clientContexts.get(client);
    if (ctx?.workspaceId && ctx?.documentId) {
      this.roomManager.removeClient(ctx.workspaceId, ctx.documentId, client);
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
    const ctx = this.clientContexts.get(client) ?? {};
    ctx.workspaceId = workspaceId;
    ctx.documentId = documentId;
    this.clientContexts.set(client, ctx);

    // Register socket in the room
    await this.roomManager.addClient(workspaceId, documentId, client);

    // Decode client state vector if provided
    const clientVector = stateVector
      ? Buffer.from(stateVector, 'base64')
      : undefined;

    // Calculate missing updates (Sync Step 2)
    const diffUpdate = await this.roomManager.getDiffUpdate(
      workspaceId,
      documentId,
      clientVector,
    );

    // Send missing updates to the newly connected client
    client.send(
      JSON.stringify({
        event: 'sync-step-2',
        documentId,
        update: Buffer.from(diffUpdate).toString('base64'),
      }),
    );

    this.logger.debug(`Client joined room ${workspaceId}:${documentId}`);
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

    // 1. Apply to server-side room and queue persistence
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
      awarenessData: any; // Cursor position, active block, user name, color
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
   * Helper to broadcast a message to all connected clients in a specific room.
   */
  private broadcastToRoom(
    workspaceId: string,
    documentId: string,
    message: Record<string, any>,
    excludeClient?: WebSocket,
  ): void {
    const payload = JSON.stringify(message);

    // We can fetch room clients from YjsRoomManager
    void this.roomManager
      .getOrCreateRoom(workspaceId, documentId)
      .then((room) => {
        for (const peer of room.clients) {
          if (peer !== excludeClient && peer.readyState === peer.OPEN) {
            peer.send(payload);
          }
        }
      });
  }
}
