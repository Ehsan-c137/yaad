import type { StateCreator } from "zustand";

import type {
  CalendarCategory,
  CalendarCategorySlice,
  CalendarMutationOptions,
  CalendarState,
} from "../types";

import { storage } from "../../../lib/storage/storage-provider";
import { INITIAL_CATEGORIES } from "../constants";

export const createCategorySlice: StateCreator<
  CalendarState,
  [],
  [],
  CalendarCategorySlice
> = (set) => ({
  categories: INITIAL_CATEGORIES,

  toggleCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, checked: !c.checked } : c,
      ),
    }));
  },

  addCategory: (
    category: CalendarCategory,
    options?: CalendarMutationOptions,
  ) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));

    if (!options?.skipPersistence) {
      void storage.saveCalendarCategory?.(category);
    }
  },

  updateCategory: (
    id: string,
    updates: Partial<CalendarCategory>,
    options?: CalendarMutationOptions,
  ) => {
    let updatedCategory: CalendarCategory | undefined;

    set((state) => ({
      categories: state.categories.map((c) => {
        if (c.id === id) {
          updatedCategory = { ...c, ...updates };
          return updatedCategory;
        }

        return c;
      }),
    }));

    if (!options?.skipPersistence && updatedCategory) {
      void storage.saveCalendarCategory?.(updatedCategory);
    }
  },

  deleteCategory: (id: string, options?: CalendarMutationOptions) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      events: state.events.filter((e) => e.calendarId !== id),
    }));

    if (!options?.skipPersistence) {
      void storage.deleteCalendarCategory?.(id);
    }
  },

  upsertCategoryFromRemote: (category: CalendarCategory) => {
    set((state) => {
      const exists = state.categories.some((c) => c.id === category.id);
      return {
        categories: exists
          ? state.categories.map((c) => (c.id === category.id ? category : c))
          : [...state.categories, category],
      };
    });
  },
});
