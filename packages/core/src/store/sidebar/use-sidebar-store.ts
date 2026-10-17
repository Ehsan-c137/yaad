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

// Cross-tab and sync listener: reloads workspace pages whenever remote sync or another tab updates the tree
if (typeof window !== "undefined") {
  const reloadPagesForWorkspace = async (workspaceId?: string) => {
    try {
      const { useWorkspaceStore } = await import("../use-workspace-store");
      const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
      const target = workspaceId || activeWs || "ws_personal";

      if (!workspaceId || !activeWs || workspaceId === activeWs) {
        await useSidebarStore.getState().loadWorkspacePages(target);
      }
    } catch {
      await useSidebarStore
        .getState()
        .loadWorkspacePages(workspaceId || "ws_personal");
    }
  };

  window.addEventListener("yaad:sync:tree-updated", ((
    event: CustomEvent<{ workspaceId: string }>,
  ) => {
    void reloadPagesForWorkspace(event.detail?.workspaceId);
  }) as EventListener);

  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel("yaad-sync-channel");

      channel.onmessage = (event) => {
        if (
          event.data?.type === "tree-updated" ||
          event.data?.type === "tree-persisted"
        ) {
          void reloadPagesForWorkspace(event.data.workspaceId);
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }
  }
}
