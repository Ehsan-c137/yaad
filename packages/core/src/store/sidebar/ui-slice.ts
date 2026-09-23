import type { StateCreator } from "zustand";

import type { SidebarState, SidebarUiSlice } from "./types";

export const createUiSlice: StateCreator<
  SidebarState,
  [],
  [],
  SidebarUiSlice
> = (set) => ({
  _hasHydrated: false,
  isLoading: true,
  isSidebarOpen: true,
  activePageId: null,

  setHasHydrated: (state) => set({ _hasHydrated: state }),
  setIsLoading: (state) => set({ isLoading: state }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActivePageId: (pageId: string) => set({ activePageId: pageId }),
});
