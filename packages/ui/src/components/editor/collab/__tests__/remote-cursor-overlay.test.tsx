import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React, { createRef } from "react";
import { RemoteCursorOverlay } from "../remote-cursor-overlay";
import type { CollabPeer } from "@/hooks/editor/use-collab";

describe("RemoteCursorOverlay (Unit Tests)", () => {
  it("renders nothing when peers list is empty", () => {
    const containerRef = createRef<HTMLDivElement>();
    const { container } = render(
      <RemoteCursorOverlay
        containerRef={containerRef}
        peers={[]}
        blockId="b_1"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when peers are on other blocks", () => {
    const containerRef = createRef<HTMLDivElement>();
    const peers: CollabPeer[] = [
      {
        id: "peer_1",
        name: "Alice",
        color: "#3B82F6",
        activeBlockId: "b_other",
        cursor: { offset: 3 },
      },
    ];

    const { container } = render(
      <RemoteCursorOverlay
        containerRef={containerRef}
        peers={peers}
        blockId="b_1"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders remote caret and name tag when peer is on the active block", () => {
    const div = document.createElement("div");
    div.innerText = "Collaborative line of text";
    document.body.appendChild(div);
    const containerRef = { current: div };

    const peers: CollabPeer[] = [
      {
        id: "peer_1",
        name: "Alice",
        color: "#10B981",
        activeBlockId: "b_1",
        cursor: { offset: 5 },
      },
    ];

    render(
      <RemoteCursorOverlay
        containerRef={containerRef}
        peers={peers}
        blockId="b_1"
      />,
    );

    expect(screen.getByTestId("remote-cursor-overlay")).toBeDefined();
    expect(screen.getByTestId("remote-caret-peer_1")).toBeDefined();
    expect(screen.getByTestId("remote-name-tag-peer_1").textContent).toContain("Alice");
  });

  it("renders selection highlight when peer has a text selection", () => {
    const div = document.createElement("div");
    div.innerText = "Collaborative line of text";
    document.body.appendChild(div);
    const containerRef = { current: div };

    const peers: CollabPeer[] = [
      {
        id: "peer_2",
        name: "Bob",
        color: "#EF4444",
        activeBlockId: "b_1",
        cursor: {
          offset: 10,
          selection: { start: 2, end: 8 },
        },
      },
    ];

    render(
      <RemoteCursorOverlay
        containerRef={containerRef}
        peers={peers}
        blockId="b_1"
      />,
    );

    expect(screen.getByTestId("remote-name-tag-peer_2").textContent).toContain("Bob");
  });
});
