import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CalendarMutationOptions, CalendarState } from "./types";

import { createCategorySlice } from "./slices/category-slice";
import { createEventSlice } from "./slices/event-slice";
import { createProviderSlice } from "./slices/provider-slice";
import { createStorageSlice } from "./slices/storage-slice";
import { createViewSlice } from "./slices/view-slice";

export type { CalendarMutationOptions, CalendarState };

export const useCalendarStore = create<CalendarState>()(
  persist(
    (...args) => ({
      ...createViewSlice(...args),
      ...createCategorySlice(...args),
      ...createEventSlice(...args),
      ...createProviderSlice(...args),
      ...createStorageSlice(...args),
    }),
    {
      name: "yaad-calendar-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        categories: state.categories,
        providers: state.providers,
      }),
    },
  ),
);
