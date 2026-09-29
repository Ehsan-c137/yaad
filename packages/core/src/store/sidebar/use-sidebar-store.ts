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
      // Only persist lightweight UI preferences.
      // pages/rootPageIds are owned by the StorageAdapter (SQL/IndexedDB)
      // and loaded on demand via loadWorkspacePages().
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        activePageId: state.activePageId,
      }),
      // _hasHydrated is set by loadWorkspacePages() after the adapter
      // has populated pages — not here — to avoid a flash of the empty
      // state between localStorage rehydration and adapter load.
    },
  ),
);
