import * as Y from 'yjs';

export interface CollabClientOptions {
  serverUrl: string; // e.g. "ws://localhost:3000/collab"
  workspaceId: string;
  documentId: string;
  ydoc: Y.Doc;
  token?: string;
  onAwareness?: (awarenessData: any) => void;
  onPeerLeave?: (userId: string) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
  WebSocketClass?: typeof WebSocket;
}

export class CollabClient {
  private ws: WebSocket | null = null;
  private readonly ydoc: Y.Doc;
  private readonly workspaceId: string;
  private readonly documentId: string;
  private readonly serverUrl: string;
  private readonly token?: string;
  private readonly onAwareness?: (awarenessData: any) => void;
  private readonly onPeerLeave?: (userId: string) => void;
  private readonly onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
  private readonly WebSocketClass: typeof WebSocket;
  private pendingAwareness: any = null;
  private isDestroyed = false;

  private readonly updateHandler: (update: Uint8Array, origin: any) => void;

  constructor(options: CollabClientOptions) {
    this.serverUrl = options.serverUrl;
    this.workspaceId = options.workspaceId;
    this.documentId = options.documentId;
    this.ydoc = options.ydoc;
    this.token = options.token;
    this.onAwareness = options.onAwareness;
    this.onPeerLeave = options.onPeerLeave;
    this.onStatusChange = options.onStatusChange;
    this.WebSocketClass =
      options.WebSocketClass ?? (typeof WebSocket !== 'undefined' ? WebSocket : (null as any));

    // Listen to local Y.Doc updates and send to server
    this.updateHandler = (update: Uint8Array, origin: any) => {
      if (origin === 'server' || !this.isConnected()) return;

      const base64Update = this.uint8ArrayToBase64(update);
      console.log('[CollabClient] Sending sync-update to server');
      this.send({
        event: 'sync-update',
        workspaceId: this.workspaceId,
        documentId: this.documentId,
        update: base64Update,
      });
    };

    this.ydoc.on('update', this.updateHandler);
  }

  connect(): void {
    if (this.isDestroyed || !this.WebSocketClass) return;

    this.onStatusChange?.('connecting');
    this.ws = new this.WebSocketClass(this.serverUrl);

    this.ws.onopen = () => {
      this.onStatusChange?.('connected');

      // 1. Initiate Sync Step 1: Send client state vector
      const clientVector = Y.encodeStateVector(this.ydoc);
      const base64Vector = this.uint8ArrayToBase64(clientVector);

      this.send({
        event: 'join-room',
        workspaceId: this.workspaceId,
        documentId: this.documentId,
        token: this.token,
        stateVector: base64Vector,
      });

      // 2. If client has local document state, send initial sync update so server has the doc
      const localUpdate = Y.encodeStateAsUpdate(this.ydoc);
      if (localUpdate.length > 2) {
        this.send({
          event: 'sync-update',
          workspaceId: this.workspaceId,
          documentId: this.documentId,
          update: this.uint8ArrayToBase64(localUpdate),
        });
      }

      // 3. Send initial presence if set
      if (this.pendingAwareness) {
        this.send({
          event: 'awareness-update',
          workspaceId: this.workspaceId,
          documentId: this.documentId,
          awarenessData: this.pendingAwareness,
        });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
        this.handleMessage(data);
      } catch (err) {
        console.error('[CollabClient] Error handling message:', err);
      }
    };

    this.ws.onclose = () => {
      this.onStatusChange?.('disconnected');
    };

    this.ws.onerror = (err) => {
      console.error('[CollabClient] WebSocket error:', err);
    };
  }

  private handleMessage(data: any): void {
    const event = data.event;
    const payload = data.data ?? data;

    if (event === 'sync-step-2' || event === 'sync-update') {
      const update = payload.update ?? data.update;
      if (update) {
        console.log(`[CollabClient] Applying ${event} from server`);
        const binaryUpdate = this.base64ToUint8Array(update);
        // Apply update marking origin as 'server' to avoid circular relay
        Y.applyUpdate(this.ydoc, binaryUpdate, 'server');
      }
    } else if (event === 'awareness-update') {
      const awarenessData = payload.awarenessData ?? data.awarenessData;
      if (awarenessData) {
        this.onAwareness?.(awarenessData);
      }
    } else if (event === 'peer-leave') {
      const userId = payload.userId ?? data.userId;
      if (userId) {
        this.onPeerLeave?.(userId);
      }
    }
  }

  sendAwareness(awarenessData: any): void {
    this.pendingAwareness = awarenessData;
    if (!this.isConnected()) return;

    this.send({
      event: 'awareness-update',
      workspaceId: this.workspaceId,
      documentId: this.documentId,
      awarenessData,
    });
  }

  disconnect(): void {
    this.isDestroyed = true;
    this.ydoc.off('update', this.updateHandler);
    if (this.ws) {
      this.ws.close?.();
      this.ws = null;
    }
    this.onStatusChange?.('disconnected');
  }

  private isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === 1;
  }

  private send(payload: Record<string, any>): void {
    if (this.isConnected()) {
      const envelope = {
        ...payload,
        data: payload,
      };
      this.ws?.send(JSON.stringify(envelope));
    }
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
