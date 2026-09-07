import { beforeEach, describe, expect, it } from "vitest";

import type { NotificationItem } from "../use-inbox-store";

import { useInboxStore } from "../use-inbox-store";

function makeNotification(
  id: string,
  overrides: Partial<NotificationItem> = {},
): NotificationItem {
  return {
    id,
    title: `Title ${id}`,
    description: "Description",
    type: "mention",
    read: false,
    createdAt: 1,
    ...overrides,
  };
}

describe("useInboxStore (Unit Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useInboxStore.setState({
      notifications: [
        makeNotification("a"),
        makeNotification("b", { read: true }),
      ],
      filter: "all",
      _hasHydrated: false,
    });
  });

  it("marks a single notification as read", () => {
    useInboxStore.getState().markAsRead("a");

    expect(
      useInboxStore.getState().notifications.find((n) => n.id === "a")?.read,
    ).toBe(true);
  });

  it("toggles the read state back and forth", () => {
    useInboxStore.getState().toggleRead("b");

    expect(
      useInboxStore.getState().notifications.find((n) => n.id === "b")?.read,
    ).toBe(false);

    useInboxStore.getState().toggleRead("b");

    expect(
      useInboxStore.getState().notifications.find((n) => n.id === "b")?.read,
    ).toBe(true);
  });

  it("marks every notification as read", () => {
    useInboxStore.getState().markAllAsRead();

    expect(useInboxStore.getState().notifications.every((n) => n.read)).toBe(
      true,
    );
  });

  it("deletes a single notification", () => {
    useInboxStore.getState().deleteNotification("a");

    expect(useInboxStore.getState().notifications.map((n) => n.id)).toEqual([
      "b",
    ]);
  });

  it("clears all notifications", () => {
    useInboxStore.getState().clearAll();

    expect(useInboxStore.getState().notifications).toHaveLength(0);
  });

  it("prepends a new unread notification with generated metadata", () => {
    useInboxStore.getState().addNotification({
      title: "New mention",
      description: "You were mentioned",
      type: "mention",
    });

    const { notifications } = useInboxStore.getState();

    expect(notifications).toHaveLength(3);

    const added = notifications[0];

    expect(added.title).toBe("New mention");
    expect(added.id).toMatch(/^notif_/);
    expect(added.read).toBe(false);
    expect(typeof added.createdAt).toBe("number");
  });

  it("updates the inbox filter", () => {
    useInboxStore.getState().setFilter("unread");

    expect(useInboxStore.getState().filter).toBe("unread");
  });

  it("tracks hydration", () => {
    useInboxStore.getState().setHasHydrated(true);

    expect(useInboxStore.getState()._hasHydrated).toBe(true);
  });
});
