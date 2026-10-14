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

import { Optional } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

interface ClientContext {
  workspaceId?: string;
  documentId?: string;
  userId?: string;
  awarenessData?: any;
}

@WebSocketGateway({
  path: '/collab',
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CollabGateway.name);
  private readonly clientContexts = new Map<WebSocket, ClientContext>();

  // Gateway manages its own WebSocket room subscribers (SRP & Law of Demeter compliant)
  private readonly roomSubscribers = new Map<string, Set<WebSocket>>();

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(ROOM_MANAGER)
    private readonly roomManager: IRoomManager,
    @Optional()
    private readonly authService?: AuthService,
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
          userId: ctx.userId ?? ctx.awarenessData?.user?.id,
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
    rawData: any,
  ): Promise<void> {
    const data = (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data)
      ? rawData.data
      : (rawData ?? {});
    const workspaceId = data.workspaceId ?? rawData?.workspaceId;
    const documentId = data.documentId ?? rawData?.documentId;
    const token = data.token ?? rawData?.token;
    const stateVector = data.stateVector ?? rawData?.stateVector;

    if (!workspaceId || !documentId) {
      this.logger.warn(`join-room received without workspaceId or documentId: ${JSON.stringify(rawData)}`);
      return;
    }

    // Verify token and membership if authService and token are present
    let authenticatedUserId = 'anonymous';
    if (this.authService && token) {
      try {
        const payload = await this.authService.verifyToken(token);
        const isMember = await this.authService.isUserMemberOfWorkspace(
          payload.sub,
          workspaceId,
        );
        if (!isMember) {
          client.send(
            JSON.stringify({
              event: 'error',
              message: `Forbidden: not an authorized member of workspace ${workspaceId}`,
            }),
          );
          client.close();
          return;
        }
        authenticatedUserId = payload.sub;
      } catch {
        client.send(
          JSON.stringify({
            event: 'error',
            message: 'Unauthorized: invalid or expired authentication token',
          }),
        );
        client.close();
        return;
      }
    }

    const roomKey = this.getRoomKey(workspaceId, documentId);

    const ctx = this.clientContexts.get(client) ?? {};
    ctx.workspaceId = workspaceId;
    ctx.documentId = documentId;
    ctx.userId = authenticatedUserId;
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
    const diffUpdateBase64 = Buffer.from(diffUpdate).toString('base64');
    client.send(
      JSON.stringify({
        event: 'sync-step-2',
        documentId,
        update: diffUpdateBase64,
        data: {
          documentId,
          update: diffUpdateBase64,
        },
      }),
    );

    // 6. Send existing peers' awareness to joining client
    if (subscribers) {
      for (const peer of subscribers) {
        if (peer !== client && peer.readyState === 1) {
          const peerCtx = this.clientContexts.get(peer);
          if (peerCtx?.awarenessData) {
            client.send(
              JSON.stringify({
                event: 'awareness-update',
                documentId,
                awarenessData: peerCtx.awarenessData,
                data: {
                  documentId,
                  awarenessData: peerCtx.awarenessData,
                },
              }),
            );
          }
        }
      }
    }

    this.logger.debug(`Client joined room ${roomKey}`);
  }

  /**
   * Handles continuous incremental binary CRDT updates from a client.
   */
  @SubscribeMessage('sync-update')
  async handleSyncUpdate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    rawData: any,
  ): Promise<void> {
    const data = (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data)
      ? rawData.data
      : (rawData ?? {});
    const workspaceId = data.workspaceId ?? rawData?.workspaceId;
    const documentId = data.documentId ?? rawData?.documentId;
    const update = data.update ?? rawData?.update;

    if (!workspaceId || !documentId || !update) return;

    // 1. Broadcast immediately to all other collaborators in the room
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

    // 2. Apply to CRDT engine and persist in background
    try {
      const binaryUpdate = Buffer.from(update, 'base64');
      await this.roomManager.applyUpdate(workspaceId, documentId, binaryUpdate);
    } catch (err: any) {
      this.logger.warn(`Could not persist CRDT update for ${documentId}: ${err.message}`);
    }
  }

  /**
   * Relays ephemeral presence / cursor awareness to all other clients in the room.
   */
  @SubscribeMessage('awareness-update')
  handleAwarenessUpdate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    rawData: any,
  ): void {
    const data = (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data)
      ? rawData.data
      : (rawData ?? {});
    const workspaceId = data.workspaceId ?? rawData?.workspaceId;
    const documentId = data.documentId ?? rawData?.documentId;
    const awarenessData = data.awarenessData ?? rawData?.awarenessData;

    if (!workspaceId || !documentId) return;

    const ctx = this.clientContexts.get(client);
    if (ctx) {
      ctx.awarenessData = awarenessData;
    }

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
   * Relays real-time workspace tree (sidebar page hierarchy) updates to all clients in the workspace.
   */
  @SubscribeMessage('tree-update')
  handleTreeUpdate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() rawData: any,
  ): void {
    const data = (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data)
      ? rawData.data
      : (rawData ?? {});
    const workspaceId = data.workspaceId ?? rawData?.workspaceId;
    const tree = data.tree ?? rawData?.tree;

    if (!workspaceId || !tree) return;

    this.broadcastToWorkspace(
      workspaceId,
      {
        event: 'tree-update',
        workspaceId,
        tree,
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

    const payload = JSON.stringify({
      ...message,
      data: message,
    });
    for (const peer of subscribers) {
      if (peer !== excludeClient && peer.readyState === 1) {
        peer.send(payload);
      }
    }
  }

  /**
   * Helper to broadcast a message to all active clients in a workspace.
   */
  private broadcastToWorkspace(
    workspaceId: string,
    message: Record<string, any>,
    excludeClient?: WebSocket,
  ): void {
    const payload = JSON.stringify({
      ...message,
      data: message,
    });

    for (const [peer, ctx] of this.clientContexts.entries()) {
      if (peer !== excludeClient && ctx.workspaceId === workspaceId && peer.readyState === 1) {
        peer.send(payload);
      }
    }
  }

  /**
   * Broadcasts a real-time role change event to all active sessions of a user in a workspace.
   */
  notifyMemberRoleUpdated(
    workspaceId: string,
    userId: string,
    newRole: string,
  ): void {
    const payload = JSON.stringify({
      event: 'member-role-updated',
      workspaceId,
      userId,
      role: newRole,
      data: {
        event: 'member-role-updated',
        workspaceId,
        userId,
        role: newRole,
      },
    });

    for (const [peer, ctx] of this.clientContexts.entries()) {
      const peerUserId = ctx.userId ?? ctx.awarenessData?.user?.id;
      if (ctx.workspaceId === workspaceId && peerUserId === userId && peer.readyState === 1) {
        peer.send(payload);
      }
    }
  }

  /**
   * Notifies and disconnects a kicked member from the workspace sessions in real-time.
   */
  notifyMemberRemoved(
    workspaceId: string,
    userId: string,
  ): void {
    const payload = JSON.stringify({
      event: 'member-kicked',
      workspaceId,
      userId,
      data: {
        event: 'member-kicked',
        workspaceId,
        userId,
      },
    });

    for (const [peer, ctx] of this.clientContexts.entries()) {
      const peerUserId = ctx.userId ?? ctx.awarenessData?.user?.id;
      if (ctx.workspaceId === workspaceId && peerUserId === userId && peer.readyState === 1) {
        peer.send(payload);
        try {
          peer.close(4003, 'Removed from workspace');
        } catch {
          // Ignore socket close error if already terminating
        }
      }
    }
  }
}
