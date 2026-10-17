"use client";

import type { RefObject } from "react";

import { useEffect, useState } from "react";

import type { CollabPeer } from "@/hooks/editor/use-collab";
import type {
  CursorCoordinates,
  SelectionRectangle,
} from "@/lib/cursor-coordinates";

import {
  getCaretCoordinates,
  getSelectionRectangles,
} from "@/lib/cursor-coordinates";

export interface RemoteCursorOverlayProps {
  containerRef: RefObject<HTMLDivElement | null>;
  peers: CollabPeer[];
  blockId: string;
}

interface PeerVisualState {
  peer: CollabPeer;
  caret: CursorCoordinates | null;
  selections: SelectionRectangle[];
}

export function RemoteCursorOverlay({
  containerRef,
  peers,
  blockId,
}: RemoteCursorOverlayProps) {
  const [visualStates, setVisualStates] = useState<PeerVisualState[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computePositions = () => {
      const activePeers = peers.filter(
        (p) => p.activeBlockId === blockId && p.cursor !== undefined,
      );

      const states: PeerVisualState[] = activePeers.map((peer) => {
        const offset = peer.cursor?.offset ?? 0;
        const caret = getCaretCoordinates(container, offset);

        let selections: SelectionRectangle[] = [];

        if (peer.cursor?.selection) {
          selections = getSelectionRectangles(
            container,
            peer.cursor.selection.start,
            peer.cursor.selection.end,
          );
        }

        return { peer, caret, selections };
      });

      setVisualStates(states);
    };

    computePositions();

    const handleResize = () => computePositions();
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(() => computePositions());
    observer.observe(container, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [peers, blockId, containerRef]);

  if (visualStates.length === 0) return null;

  return (
    <div
      data-testid="remote-cursor-overlay"
      className="absolute inset-0 pointer-events-none overflow-visible"
    >
      {/* Remote Selection Highlights */}
      {visualStates.map(({ peer, selections }) =>
        selections.map((rect, idx) => (
          <div
            key={`sel-${peer.id}-${idx}`}
            data-testid={`remote-selection-${peer.id}-${idx}`}
            className="absolute rounded-sm transition-all duration-75"
            style={{
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              backgroundColor: peer.color,
              opacity: 0.25,
            }}
          />
        )),
      )}

      {/* Remote Carets and Name Badges */}
      {visualStates.map(({ peer, caret }) => {
        if (!caret) return null;

        return (
          <div
            key={`caret-${peer.id}`}
            data-testid={`remote-caret-${peer.id}`}
            className="absolute z-30 transition-all duration-100 ease-out"
            style={{
              top: `${caret.top}px`,
              left: `${caret.left}px`,
              height: `${caret.height}px`,
            }}
          >
            {/* Blinking colored vertical line */}
            <div
              className="w-[2px] h-full rounded-full animate-pulse"
              style={{ backgroundColor: peer.color }}
            />

            {/* Collaborator name pill tag */}
            <div
              data-testid={`remote-name-tag-${peer.id}`}
              className="absolute -top-5 ltr:left-0 rtl:right-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm whitespace-nowrap select-none"
              style={{ backgroundColor: peer.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              <span>{peer.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
