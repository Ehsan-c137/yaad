import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";

import { CollabClient } from "../collab-client";

class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  sentMessages: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = 3;
    this.onclose?.();
  }
}

describe("CollabClient", () => {
  let ydoc: Y.Doc;

  beforeEach(() => {
    ydoc = new Y.Doc();
  });

  it("broadcasts tree updates over WebSocket", () => {
    const client = new CollabClient({
      serverUrl: "ws://localhost:3000/collab",
      workspaceId: "ws_test",
      documentId: "doc_1",
      ydoc,
      WebSocketClass: MockWebSocket as any,
    });
    client.connect();

    const mockWs = (client as any).ws as MockWebSocket;
    mockWs.readyState = MockWebSocket.OPEN;

    const mockTree = [{ id: "p1", title: "Page 1", parentId: null, order: 0 }];
    client.sendTreeUpdate(mockTree);

    const sent = mockWs.sentMessages.map((m) => JSON.parse(m));
    const treeMsg = sent.find((m) => m.event === "tree-update");
    expect(treeMsg).toBeDefined();
    expect(treeMsg?.workspaceId).toBe("ws_test");
    expect(treeMsg?.tree).toEqual(mockTree);

    client.disconnect();
  });

  it("dispatches onTreeUpdate when receiving tree-update event", () => {
    const onTreeUpdate = vi.fn((): void => {});
    const client = new CollabClient({
      serverUrl: "ws://localhost:3000/collab",
      workspaceId: "ws_test",
      documentId: "doc_1",
      ydoc,
      onTreeUpdate,
      WebSocketClass: MockWebSocket as any,
    });
    client.connect();

    const mockWs = (client as any).ws as MockWebSocket;
    const incomingTree = [
      { id: "p2", title: "Remote Page", parentId: null, order: 1 },
    ];

    mockWs.onmessage?.({
      data: JSON.stringify({
        event: "tree-update",
        workspaceId: "ws_test",
        tree: incomingTree,
      }),
    });

    expect(onTreeUpdate).toHaveBeenCalledWith(incomingTree);
    client.disconnect();
  });

  it("triggers onMemberRoleUpdated when receiving member-role-updated event for this user", () => {
    const onMemberRoleUpdated = vi.fn((): void => {});
    const client = new CollabClient({
      serverUrl: "ws://localhost:3000/collab",
      workspaceId: "ws_test",
      documentId: "doc_1",
      ydoc,
      userId: "user_123",
      onMemberRoleUpdated,
      WebSocketClass: MockWebSocket as any,
    });
    client.connect();

    const mockWs = (client as any).ws as MockWebSocket;

    mockWs.onmessage?.({
      data: JSON.stringify({
        event: "member-role-updated",
        workspaceId: "ws_test",
        userId: "user_123",
        role: "viewer",
      }),
    });

    expect(onMemberRoleUpdated).toHaveBeenCalledWith("viewer");
    client.disconnect();
  });

  it("triggers onMemberKicked when receiving member-kicked event for this user", () => {
    const onMemberKicked = vi.fn((): void => {});
    const client = new CollabClient({
      serverUrl: "ws://localhost:3000/collab",
      workspaceId: "ws_test",
      documentId: "doc_1",
      ydoc,
      userId: "user_123",
      onMemberKicked,
      WebSocketClass: MockWebSocket as any,
    });
    client.connect();

    const mockWs = (client as any).ws as MockWebSocket;

    mockWs.onmessage?.({
      data: JSON.stringify({
        event: "member-kicked",
        workspaceId: "ws_test",
        userId: "user_123",
      }),
    });

    expect(onMemberKicked).toHaveBeenCalled();
    client.disconnect();
  });
});
