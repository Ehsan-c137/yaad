"use client";

import React, { createContext, useContext } from "react";
import { useCollab, type CollabPeer } from "../hooks/editor/use-collab";

interface CollabContextValue {
  status: "connecting" | "connected" | "disconnected";
  peers: CollabPeer[];
  broadcastFocus: (blockId: string | null) => void;
}

const CollabContext = createContext<CollabContextValue>({
  status: "disconnected",
  peers: [],
  broadcastFocus: () => {},
});

export function CollabProvider({
  workspaceId,
  pageId,
  children,
}: {
  workspaceId: string | undefined;
  pageId: string | undefined;
  children: React.ReactNode;
}) {
  const collab = useCollab(workspaceId, pageId);

  return (
    <CollabContext.Provider value={collab}>
      {children}
    </CollabContext.Provider>
  );
}

export function useCollabContext(): CollabContextValue {
  return useContext(CollabContext);
}
