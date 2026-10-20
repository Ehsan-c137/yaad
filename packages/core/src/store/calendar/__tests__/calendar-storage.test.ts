import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StorageAdapter } from "../../../lib/storage/types";
import type { CalendarCategory, CalendarEvent } from "../types";

import { setStorageAdapter } from "../../../lib/storage/storage-provider";
import { useCalendarStore } from "../use-calendar-store";

describe("useCalendarStore Storage Persistence & Sync", () => {
  let mockAdapter: StorageAdapter;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockAdapter = {
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
      saveCalendarEvent: vi.fn().mockResolvedValue(undefined),
      deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
      getCalendarEvents: vi.fn().mockResolvedValue([]),
      saveCalendarCategory: vi.fn().mockResolvedValue(undefined),
      deleteCalendarCategory: vi.fn().mockResolvedValue(undefined),
      getCalendarCategories: vi.fn().mockResolvedValue([]),
    };
    setStorageAdapter(mockAdapter);

    useCalendarStore.setState({
      events: [],
      categories: [],
      hasHydratedFromStorage: false,
    });
  });

  it("calls storage.saveCalendarEvent when addEvent is called", () => {
    useCalendarStore.getState().addEvent({
      id: "evt_test_1",
      title: "Design Review",
      calendarId: "work",
      date: "2026-10-25",
      startTime: "10:00",
      endTime: "11:00",
    });

    expect(mockAdapter.saveCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_test_1",
        title: "Design Review",
      }),
    );
  });

  it("calls storage.saveCalendarEvent when updateEvent is called", () => {
    const event: CalendarEvent = {
      id: "evt_test_2",
      title: "Updated Title",
      calendarId: "work",
      date: "2026-10-25",
      startTime: "14:00",
      endTime: "15:00",
    };

    useCalendarStore.getState().updateEvent(event);
    expect(mockAdapter.saveCalendarEvent).toHaveBeenCalledWith(event);
  });

  it("calls storage.deleteCalendarEvent when deleteEvent is called", () => {
    useCalendarStore.getState().deleteEvent("evt_test_2");
    expect(mockAdapter.deleteCalendarEvent).toHaveBeenCalledWith("evt_test_2");
  });

  it("calls storage.saveCalendarCategory when addCategory or updateCategory is called", () => {
    const category: CalendarCategory = {
      id: "cat_marketing",
      name: "Marketing",
      dotColor: "#f59e0b",
      badgeBg: "rgba(254, 243, 199, 0.95)",
      badgeBorder: "rgba(253, 230, 138, 0.9)",
      badgeText: "#b45309",
      badgeDarkBg: "rgba(120, 53, 15, 0.45)",
      badgeDarkBorder: "rgba(245, 158, 11, 0.5)",
      badgeDarkText: "#fde68a",
      checked: true,
    };

    useCalendarStore.getState().addCategory(category);
    expect(mockAdapter.saveCalendarCategory).toHaveBeenCalledWith(category);

    useCalendarStore
      .getState()
      .updateCategory("cat_marketing", { name: "Growth" });
    expect(mockAdapter.saveCalendarCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cat_marketing",
        name: "Growth",
      }),
    );
  });

  it("calls storage.deleteCalendarCategory when deleteCategory is called", () => {
    useCalendarStore.getState().deleteCategory("cat_marketing");
    expect(mockAdapter.deleteCalendarCategory).toHaveBeenCalledWith(
      "cat_marketing",
    );
  });

  it("hydrates categories and events from storage via loadCalendarFromStorage", async () => {
    const mockCat: CalendarCategory = {
      id: "cat_hydrated",
      name: "Hydrated Category",
      dotColor: "#10b981",
      badgeBg: "green",
      badgeBorder: "green",
      badgeText: "green",
      badgeDarkBg: "darkgreen",
      badgeDarkBorder: "darkgreen",
      badgeDarkText: "green",
      checked: true,
    };

    const mockEvt: CalendarEvent = {
      id: "evt_hydrated",
      title: "Hydrated Event",
      calendarId: "cat_hydrated",
      date: "2026-10-26",
      startTime: "09:00",
      endTime: "10:00",
    };

    (mockAdapter.getCalendarCategories as any).mockResolvedValue([mockCat]);
    (mockAdapter.getCalendarEvents as any).mockResolvedValue([mockEvt]);

    await useCalendarStore.getState().loadCalendarFromStorage();

    const state = useCalendarStore.getState();
    expect(state.categories).toEqual([mockCat]);
    expect(state.events).toEqual([mockEvt]);
    expect(state.hasHydratedFromStorage).toBe(true);
  });

  it("upserts events from remote sync without triggering local persistence", () => {
    const remoteEvt: CalendarEvent = {
      id: "evt_peer",
      title: "Peer Event",
      calendarId: "work",
      date: "2026-10-27",
      startTime: "16:00",
      endTime: "17:00",
    };

    useCalendarStore.getState().upsertEventFromRemote(remoteEvt);

    expect(mockAdapter.saveCalendarEvent).not.toHaveBeenCalled();
    expect(useCalendarStore.getState().events).toContainEqual(remoteEvt);
  });
});
