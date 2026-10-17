"use client";

import { createContext } from "react";

import type { CollabPeer } from "../hooks/editor/use-collab";

export interface CollabContextValue {
  status: "connected" | "connecting" | "disconnected";
  peers: CollabPeer[];
  broadcastFocus: (blockId: string | null) => void;
  broadcastCursor: (
    cursor: {
      blockId: string;
      offset: number;
      selection?: { start: number; end: number };
    } | null,
  ) => void;
}

export const CollabContext = createContext<CollabContextValue>({
  status: "disconnected",
  peers: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  broadcastFocus: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  broadcastCursor: () => {},
});
CollabContext.displayName = "CollabContext";
