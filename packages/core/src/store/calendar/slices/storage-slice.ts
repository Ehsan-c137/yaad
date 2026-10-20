import type { StateCreator } from "zustand";

import type {
  CalendarCategoryId,
  CalendarState,
  CalendarStorageSlice,
} from "../types";

import { storage } from "../../../lib/storage/storage-provider";
import { INITIAL_CATEGORIES } from "../constants";
import { generateICS, parseICS } from "../ical-utils";

export const createStorageSlice: StateCreator<
  CalendarState,
  [],
  [],
  CalendarStorageSlice
> = (set, get) => ({
  hasHydratedFromStorage: false,

  loadCalendarFromStorage: async () => {
    try {
      const [storedCategories, storedEvents] = await Promise.all([
        storage.getCalendarCategories?.(),
        storage.getCalendarEvents?.(),
      ]);

      if (storedCategories && storedCategories.length > 0) {
        set({ categories: storedCategories });
      } else if (storage.saveCalendarCategory) {
        for (const cat of INITIAL_CATEGORIES) {
          await storage.saveCalendarCategory(cat);
        }
      }

      if (storedEvents && storedEvents.length > 0) {
        set({ events: storedEvents });
      }
    } catch (err) {
      console.warn(
        "[useCalendarStore] Failed to load calendar from storage:",
        err,
      );
    } finally {
      set({ hasHydratedFromStorage: true });
    }
  },

  importICS: (
    icsContent: string,
    targetCalendarId: CalendarCategoryId = "work",
  ) => {
    const parsed = parseICS(icsContent, targetCalendarId);
    if (parsed.length === 0) return { added: 0 };

    const existingIds = new Set(get().events.map((e) => e.id));
    const newEvents = parsed.filter((e) => !existingIds.has(e.id));

    newEvents.forEach((e) => {
      void storage.saveCalendarEvent?.(e);
    });

    set((state) => ({
      events: [...state.events, ...newEvents],
    }));

    return { added: newEvents.length };
  },

  exportICS: (calendarId?: CalendarCategoryId) => {
    const events = calendarId
      ? get().events.filter((e) => e.calendarId === calendarId)
      : get().events;

    const calName = calendarId
      ? (get().categories.find((c) => c.id === calendarId)?.name ?? "Calendar")
      : "Yaad Calendar";

    return generateICS(events, calName);
  },
});
