import type { StateCreator } from "zustand";

import type {
  CalendarEvent,
  CalendarEventSlice,
  CalendarMutationOptions,
  CalendarState,
} from "../types";

import { storage } from "../../../lib/storage/storage-provider";

export const createEventSlice: StateCreator<
  CalendarState,
  [],
  [],
  CalendarEventSlice
> = (set, get) => ({
  events: [],

  addEvent: (
    saved: Omit<CalendarEvent, "id"> & { id?: string },
    options?: CalendarMutationOptions,
  ) => {
    const newEvt: CalendarEvent = {
      ...saved,
      id: saved.id ?? `evt-${Date.now()}`,
    };
    set((state) => ({ events: [...state.events, newEvt] }));

    if (!options?.skipPersistence) {
      void storage.saveCalendarEvent?.(newEvt);
    }
  },

  updateEvent: (event: CalendarEvent, options?: CalendarMutationOptions) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));

    if (!options?.skipPersistence) {
      void storage.saveCalendarEvent?.(event);
    }
  },

  deleteEvent: (id: string, options?: CalendarMutationOptions) => {
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      selectedEventId:
        state.selectedEventId === id ? null : state.selectedEventId,
    }));

    if (!options?.skipPersistence) {
      void storage.deleteCalendarEvent?.(id);
    }
  },

  duplicateEvent: (id: string) => {
    const target = get().events.find((e) => e.id === id);
    if (!target) return;
    const copy: CalendarEvent = {
      ...target,
      id: `evt-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    get().addEvent(copy);
    get().selectEvent(copy.id);
  },

  upsertEventFromRemote: (event: CalendarEvent) => {
    set((state) => {
      const exists = state.events.some((e) => e.id === event.id);
      return {
        events: exists
          ? state.events.map((e) => (e.id === event.id ? event : e))
          : [...state.events, event],
      };
    });
  },
});
