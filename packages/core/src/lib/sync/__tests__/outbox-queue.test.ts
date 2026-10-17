import { beforeEach, describe, expect, it } from "vitest";

import { OutboxQueue } from "../outbox-queue";

describe("OutboxQueue (ADR 0001)", () => {
  let queue: OutboxQueue;

  beforeEach(async () => {
    queue = new OutboxQueue();
    await queue.clear();
  });

  it("enqueues items in FIFO order with generated id and timestamp", async () => {
    const item1 = await queue.enqueue({
      workspaceId: "ws_1",
      entityType: "document",
      entityId: "doc_1",
      operation: "upsert",
      payload: { title: "Doc 1" },
    });

    const item2 = await queue.enqueue({
      workspaceId: "ws_1",
      entityType: "workspace_tree",
      entityId: "ws_1",
      operation: "upsert",
      payload: [],
    });

    expect(item1.id).toBeDefined();
    expect(item1.timestamp).toBeGreaterThan(0);
    expect(await queue.size()).toBe(2);

    const peeked = await queue.peek(10);
    expect(peeked.length).toBe(2);
    expect(peeked[0].id).toBe(item1.id);
    expect(peeked[1].id).toBe(item2.id);
  });

  it("dequeues accepted items by id", async () => {
    const item1 = await queue.enqueue({
      workspaceId: "ws_1",
      entityType: "document",
      entityId: "doc_1",
      operation: "upsert",
      payload: {},
    });

    const item2 = await queue.enqueue({
      workspaceId: "ws_1",
      entityType: "document",
      entityId: "doc_2",
      operation: "upsert",
      payload: {},
    });

    await queue.dequeue([item1.id]);
    expect(await queue.size()).toBe(1);

    const remaining = await queue.peek();
    expect(remaining[0].id).toBe(item2.id);
  });

  it("manages version checkpoints per workspace", async () => {
    expect(await queue.getLastSyncedVersion("ws_test")).toBe(0);

    await queue.setLastSyncedVersion("ws_test", 42);
    expect(await queue.getLastSyncedVersion("ws_test")).toBe(42);
  });

  it("generates and preserves a persistent client ID", () => {
    const clientId = queue.getClientId();
    expect(clientId).toMatch(/^client_/);
    expect(queue.getClientId()).toBe(clientId);
  });
});
