import type { StateCreator } from "zustand";

import type {
  CalendarCategory,
  CalendarEvent,
  CalendarProviderConnection,
  CalendarProviderSlice,
  CalendarState,
} from "../types";

import { storage } from "../../../lib/storage/storage-provider";
import { syncProvider } from "../provider-service";

export const createProviderSlice: StateCreator<
  CalendarState,
  [],
  [],
  CalendarProviderSlice
> = (set, get) => ({
  providers: [],
  isSyncing: false,

  addProvider: (
    provider: CalendarProviderConnection,
    initialEvents: CalendarEvent[] = [],
  ) => {
    // Also ensure a corresponding category exists for this provider
    const existingCat = get().categories.find(
      (c) => c.id === provider.calendarId,
    );
    let newCategories = get().categories;

    if (!existingCat) {
      const newCategory: CalendarCategory = {
        id: provider.calendarId,
        name: provider.name,
        dotColor: provider.color,
        badgeBg: "rgba(219, 234, 254, 0.9)",
        badgeBorder: "rgba(147, 197, 253, 0.8)",
        badgeText: "#1d4ed8",
        badgeDarkBg: "rgba(30, 58, 138, 0.45)",
        badgeDarkBorder: "rgba(59, 130, 246, 0.5)",
        badgeDarkText: "#93c5fd",
        checked: true,
        provider: provider.provider,
        isCustom: true,
        isRemovable: true,
      };
      newCategories = [...newCategories, newCategory];
      void storage.saveCalendarCategory?.(newCategory);
    }

    // Deduplicate events by id
    const existingEventIds = new Set(get().events.map((e) => e.id));
    const filteredNewEvents = initialEvents.filter(
      (e) => !existingEventIds.has(e.id),
    );

    filteredNewEvents.forEach((e) => {
      void storage.saveCalendarEvent?.(e);
    });

    set((state) => ({
      providers: [...state.providers, provider],
      categories: newCategories,
      events: [...state.events, ...filteredNewEvents],
    }));
  },

  updateProvider: (
    id: string,
    updates: Partial<CalendarProviderConnection>,
  ) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    }));
  },

  removeProvider: (id: string) => {
    const target = get().providers.find((p) => p.id === id);
    if (!target) return;

    const eventsToDelete = get().events.filter(
      (e) => e.calendarId === target.calendarId,
    );
    eventsToDelete.forEach((e) => {
      void storage.deleteCalendarEvent?.(e.id);
    });
    void storage.deleteCalendarCategory?.(target.calendarId);

    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
      categories: state.categories.filter((c) => c.id !== target.calendarId),
      events: state.events.filter((e) => e.calendarId !== target.calendarId),
    }));
  },

  syncProviderConnection: async (id: string) => {
    const provider = get().providers.find((p) => p.id === id);
    if (!provider) return;

    get().updateProvider(id, {
      syncStatus: "syncing",
      errorMessage: undefined,
    });

    const result = await syncProvider(provider);

    if (result.error) {
      get().updateProvider(id, {
        syncStatus: "error",
        errorMessage: result.error,
      });
    } else {
      // Replace or merge events from this calendar
      const otherEvents = get().events.filter(
        (e) => e.calendarId !== provider.calendarId,
      );

      result.events.forEach((e) => {
        void storage.saveCalendarEvent?.(e);
      });

      set({
        events: [...otherEvents, ...result.events],
      });
      get().updateProvider(id, {
        syncStatus: "success",
        lastSyncedAt: new Date().toISOString(),
      });
    }
  },

  syncAllProviders: async () => {
    const { providers } = get();
    if (providers.length === 0) return;

    set({ isSyncing: true });

    for (const provider of providers) {
      await get().syncProviderConnection(provider.id);
    }

    set({ isSyncing: false });
  },
});
