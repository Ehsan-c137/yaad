import type { SidebarPageItem } from "@yaad/core/store/use-sidebar-store";

import { WorkspaceLayoutSkeleton } from "@ui/skeleton";
import { workspaceService } from "@yaad/core/services/workspace-service";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface WorkspaceInitializerProps {
  children: React.ReactNode;
}

export function WorkspaceInitializer({ children }: WorkspaceInitializerProps) {
  const { pathname } = useLocation();
  const [isHydrated, setIsHydrated] = useState(false);
  const loadInitialWorkspaces = useWorkspaceStore(
    (state) => state.loadInitialWorkspaces,
  );
  useEffect(() => {
    let unsubscribeSidebar: (() => void) | undefined;

    async function boot() {
      try {
        // 1. Initialize workspaces (seeds default workspace if empty)
        // This also internally triggers loadWorkspacePages for the active workspace
        await loadInitialWorkspaces();

        // 2. Setup Auto-Save Subscription for the Sidebar Page Tree
        // Whenever the user creates, reorders, or renames pages in the sidebar,
        // this automatically persists the updated array to tree_${activeWorkspaceId}
        unsubscribeSidebar = useSidebarStore.subscribe((state, prevState) => {
          const { activeWorkspaceId } = useWorkspaceStore.getState();

          if (!activeWorkspaceId) return;

          // Save only when pages or root order actually changes
          if (
            state.pages !== prevState.pages ||
            state.rootPageIds !== prevState.rootPageIds
          ) {
            const treeArrayToSave = Object.values(state.pages)
              .filter((page): page is SidebarPageItem => page !== undefined)
              .map((page) => ({
                id: page.id,
                workspaceId: activeWorkspaceId,
                title: page.title,
                icon: page.icon,
                parentId: page.parentId,
                childrenIds: page.childrenIds,
                isDeleted: page.isDeleted ?? false,
                deletedAt: page.deletedAt,
                updatedAt: Date.now(),
              }));

            void workspaceService.saveWorkspaceTree(
              activeWorkspaceId,
              treeArrayToSave,
            );
          }
        });
      } catch (error) {
        console.error("[WorkspaceInitializer] Initialization failed:", error);
      } finally {
        setIsHydrated(true);
      }
    }

    void boot();

    return () => {
      if (unsubscribeSidebar) {
        unsubscribeSidebar();
      }
    };
  }, [loadInitialWorkspaces]);

  const isTauri =
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
  const isLanding = !isTauri && pathname === "/";

  // Prevent UI flashing or hydration mismatch while reading from IndexedDB
  if (!isHydrated && !isLanding) {
    return <WorkspaceLayoutSkeleton />;
  }

  return <>{children}</>;
}
