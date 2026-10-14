import { useEffect, useRef, useState } from 'react';
import { CollabClient } from '@yaad/core/lib/crdt/collab-client';
import {
  Y,
  documentJsonToYDoc,
  yDocToDocumentJson,
} from '@yaad/core/lib/crdt/yjs-converter';
import { getDocumentStore } from '@yaad/core/store/document/use-document-store';
import { useUserStore } from '@yaad/core/store/use-user-store';

export interface CollabPeer {
  id: string;
  name: string;
  color: string;
  activeBlockId?: string;
}

export function useCollab(
  workspaceId: string | undefined,
  pageId: string | undefined,
) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [peers, setPeers] = useState<Map<string, CollabPeer>>(new Map());

  const clientRef = useRef<CollabClient | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  const token = useUserStore((s) => s.token);
  const userName = useUserStore((s) => s.userName) ?? 'Anonymous';
  const userId = useUserStore((s) => s.userId) ?? 'anon';
  const userColor = useUserStore((s) => s.userColor) ?? '#3B82F6';

  useEffect(() => {
    if (!workspaceId || !pageId) return;

    // 1. Initialize Y.Doc from local store state
    const store = getDocumentStore(pageId);
    const initialDoc = store.getState().currentDocument;
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    let isApplyingRemote = false;

    if (initialDoc) {
      documentJsonToYDoc(initialDoc, ydoc);
    }

    let lastDocJson = store.getState().currentDocument;

    // 2. Listen to remote Y.Doc updates and update local Zustand store
    const handleYDocUpdate = (_update: Uint8Array, origin: any) => {
      if (origin === 'server') {
        const updatedJson = yDocToDocumentJson(ydoc);
        if (updatedJson && Object.keys(updatedJson.blocks).length > 0) {
          isApplyingRemote = true;
          try {
            const finalDoc = {
              ...updatedJson,
              id: pageId,
              rootBlockId: updatedJson.rootBlockId || 'root',
            };
            lastDocJson = finalDoc;
            store.setState({
              currentDocument: finalDoc,
              _hasHydrated: true,
            });
          } finally {
            isApplyingRemote = false;
          }
        }
      }
    };
    ydoc.on('update', handleYDocUpdate);

    // 3. Listen to local Zustand store edits (user typing) and sync to Y.Doc
    const unsubscribeStore = store.subscribe((state) => {
      if (isApplyingRemote) return;
      if (
        state.currentDocument &&
        state.currentDocument !== lastDocJson
      ) {
        lastDocJson = state.currentDocument;
        console.log('[Collab] Local store changed, syncing to Yjs:', state.currentDocument);
        documentJsonToYDoc(state.currentDocument, ydoc);
      }
    });

    // 4. Connect CollabClient
    const client = new CollabClient({
      serverUrl: 'ws://localhost:3000/collab',
      workspaceId,
      documentId: pageId,
      ydoc,
      token: token ?? undefined,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'connected') {
          client.sendAwareness({
            user: { id: userId, name: userName, color: userColor },
          });
        }
      },
      onAwareness: (data) => {
        if (!data?.user?.id || data.user.id === userId) return;

        setPeers((prev) => {
          const next = new Map(prev);
          next.set(data.user.id, {
            id: data.user.id,
            name: data.user.name ?? 'Collaborator',
            color: data.user.color ?? '#8B5CF6',
            activeBlockId: data.activeBlockId,
          });
          return next;
        });
      },
      onPeerLeave: (leavingUserId) => {
        setPeers((prev) => {
          const next = new Map(prev);
          next.delete(leavingUserId);
          return next;
        });
      },
    });

    clientRef.current = client;
    client.connect();

    // 5. Broadcast initial presence
    client.sendAwareness({
      user: { id: userId, name: userName, color: userColor },
    });

    return () => {
      unsubscribeStore();
      ydoc.off('update', handleYDocUpdate);
      client.disconnect();
      clientRef.current = null;
      ydocRef.current = null;
      setPeers(new Map());
    };
  }, [workspaceId, pageId, token]);

  const broadcastFocus = (blockId: string | null) => {
    clientRef.current?.sendAwareness({
      user: { id: userId, name: userName, color: userColor },
      activeBlockId: blockId ?? undefined,
    });
  };

  return {
    status,
    peers: Array.from(peers.values()),
    broadcastFocus,
  };
}
