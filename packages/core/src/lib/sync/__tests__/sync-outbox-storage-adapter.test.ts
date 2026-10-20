import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StorageAdapter } from "../../storage/types";
import type { SyncOutboxAdapter } from "../sync-outbox-storage-adapter";

import { OutboxQueue } from "../outbox-queue";
import { createSyncOutboxAdapter } from "../sync-outbox-storage-adapter";

describe("createSyncOutboxAdapter (Functional Decorator)", () => {
  let mockInner: StorageAdapter;
  let queue: OutboxQueue;
  let adapter: SyncOutboxAdapter;

  beforeEach(() => {
    mockInner = {
      getWorkspaces: vi.fn().mockResolvedValue([]),
      saveWorkspace: vi.fn().mockResolvedValue(undefined),
      deleteWorkspace: vi.fn().mockResolvedValue(undefined),
      getWorkspaceTree: vi.fn().mockResolvedValue([]),
      saveWorkspaceTree: vi.fn().mockResolvedValue(undefined),
      getDocument: vi.fn().mockResolvedValue(null),
      saveDocument: vi.fn().mockResolvedValue(undefined),
      deleteDocument: vi.fn().mockResolvedValue(undefined),
      getBlob: vi.fn().mockResolvedValue(undefined),
      saveBlob: vi.fn().mockResolvedValue(undefined),
      removeBlob: vi.fn().mockResolvedValue(undefined),
    };
    queue = new OutboxQueue();
    adapter = createSyncOutboxAdapter(mockInner, { queue });
  });

  it("delegates read operations directly with zero latency without modifying outbox", async () => {
    await adapter.getDocument("doc_1");
    expect(mockInner.getDocument).toHaveBeenCalledWith("doc_1");
    expect(await queue.size()).toBe(0);

    await adapter.getWorkspaceTree("ws_1");
    expect(mockInner.getWorkspaceTree).toHaveBeenCalledWith("ws_1");
    expect(await queue.size()).toBe(0);
  });

  it("writes to inner adapter AND enqueues to outbox for saveWorkspaceTree", async () => {
    const tree = [
      {
        id: "p1",
        title: "Page 1",
        parentId: null,
        childrenIds: [],
        updatedAt: Date.now(),
      },
    ];
    await adapter.saveWorkspaceTree("ws_1", tree as any);

    expect(mockInner.saveWorkspaceTree).toHaveBeenCalledWith("ws_1", tree);
    expect(await queue.size()).toBe(1);

    const [item] = await queue.peek();
    expect(item.workspaceId).toBe("ws_1");
    expect(item.entityType).toBe("workspace_tree");
    expect(item.operation).toBe("upsert");
    expect(item.payload).toEqual(tree);
  });

  it("writes to inner adapter AND enqueues to outbox for saveDocument and deleteDocument", async () => {
    const doc = { id: "doc_123", title: "Test Doc", blocks: {} } as any;
    await adapter.saveDocument(doc);

    expect(mockInner.saveDocument).toHaveBeenCalledWith(doc);
    expect(await queue.size()).toBe(1);

    await adapter.deleteDocument("doc_123");
    expect(mockInner.deleteDocument).toHaveBeenCalledWith("doc_123");
    expect(await queue.size()).toBe(2);

    const items = await queue.peek(2);
    expect(items[0].entityType).toBe("document");
    expect(items[0].operation).toBe("upsert");
    expect(items[1].entityType).toBe("document");
    expect(items[1].operation).toBe("delete");
  });

  it("suppresses outbox enqueuing when executing inside withRemoteContext", async () => {
    await adapter.withRemoteContext(async () => {
      await adapter.saveWorkspaceTree("ws_1", []);
      await adapter.saveDocument({ id: "doc_remote", title: "Remote" } as any);
    });

    expect(mockInner.saveWorkspaceTree).toHaveBeenCalled();
    expect(mockInner.saveDocument).toHaveBeenCalled();
    // Zero mutations enqueued because it's remote sync!
    expect(await queue.size()).toBe(0);
  });

  it("writes to inner adapter AND enqueues to outbox for calendar events and categories", async () => {
    mockInner.saveCalendarEvent = vi.fn().mockResolvedValue(undefined);
    mockInner.deleteCalendarEvent = vi.fn().mockResolvedValue(undefined);
    mockInner.saveCalendarCategory = vi.fn().mockResolvedValue(undefined);
    mockInner.deleteCalendarCategory = vi.fn().mockResolvedValue(undefined);

    const event = {
      id: "evt_1",
      title: "Meeting",
      calendarId: "work",
      workspaceId: "ws_1",
    } as any;
    await adapter.saveCalendarEvent!(event);

    expect(mockInner.saveCalendarEvent).toHaveBeenCalledWith(event);
    expect(await queue.size()).toBe(1);
    const [item] = await queue.peek(1);
    expect(item.entityType).toBe("calendar_event");
    expect(item.operation).toBe("upsert");
    expect(item.entityId).toBe("evt_1");

    await adapter.deleteCalendarEvent!("evt_1");
    expect(mockInner.deleteCalendarEvent).toHaveBeenCalledWith("evt_1");
    expect(await queue.size()).toBe(2);

    const category = {
      id: "work",
      name: "Work",
      workspaceId: "ws_1",
    } as any;
    await adapter.saveCalendarCategory!(category);
    expect(mockInner.saveCalendarCategory).toHaveBeenCalledWith(category);

    await adapter.deleteCalendarCategory!("work");
    expect(mockInner.deleteCalendarCategory).toHaveBeenCalledWith("work");

    expect(await queue.size()).toBe(4);
  });
});
