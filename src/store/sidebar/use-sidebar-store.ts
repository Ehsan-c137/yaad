import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SidebarState } from "./types";

import { createPagesSlice } from "./pages-slice";
import { createUiSlice } from "./ui-slice";

export const useSidebarStore = create<SidebarState>()(
  persist(
    (...args) => ({
      ...createUiSlice(...args),
      ...createPagesSlice(...args),
    }),
    {
      name: "sidebar-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);
