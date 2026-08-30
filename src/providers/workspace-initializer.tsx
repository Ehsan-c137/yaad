"use client";

import { useEffect, useState } from "react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { workspaceService } from "@/services/workspace-service";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface WorkspaceInitializerProps {
  children: React.ReactNode;
}

export function WorkspaceInitializer({ children }: WorkspaceInitializerProps) {
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
            const treeArrayToSave = Object.values(state.pages).map((page) => ({
              id: page.id,
              workspaceId: activeWorkspaceId,
              title: page.title,
              icon: page.icon,
              parentId: page.parentId,
              childrenIds: page.childrenIds,
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

  // Prevent UI flashing or hydration mismatch while reading from IndexedDB
  if (!isHydrated) {
    return <WorkspaceLayoutSkeleton />;
  }

  return <>{children}</>;
}

function WorkspaceLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Skeleton */}
      <aside
        className={cn(
          styles.sidebar,
          "hidden h-screen w-70 shrink-0 flex-col overflow-hidden p-2 md:flex",
        )}
      >
        {/* Workspace Switcher Header */}
        <div className="flex items-center gap-2 p-1">
          <div className={cn(styles.skeleton, "size-7 shrink-0 rounded-lg")} />
          <div className={cn(styles.skeleton, "h-4 flex-1 rounded-md")} />
        </div>

        {/* Tabs area */}
        <div className="px-1 pt-2 pb-1">
          <div className={cn(styles.skeleton, "h-9 w-full rounded-full")} />
        </div>

        {/* Home / Page Tree Section Skeleton */}
        <div className="space-y-3 p-2 pt-3">
          <div className={cn(styles.skeleton, "h-3 w-16 rounded-sm")} />

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(styles.skeleton, "size-4 shrink-0 rounded-sm")}
              />
              <div className={cn(styles.skeleton, "h-4 w-2/3 rounded-full")} />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(styles.skeleton, "size-4 shrink-0 rounded-sm")}
              />
              <div className={cn(styles.skeleton, "h-4 w-4/5 rounded-full")} />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(styles.skeleton, "size-4 shrink-0 rounded-sm")}
              />
              <div className={cn(styles.skeleton, "h-4 w-1/2 rounded-full")} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Window Header Skeleton */}
        <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <div className={cn(styles.skeleton, "size-6 rounded-md")} />
            <div className="mx-0.5 h-4 w-px bg-border/60" />
            <div className={cn(styles.skeleton, "h-6 w-28 rounded-md")} />
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(styles.skeleton, "size-6 rounded-md")} />
            <div className={cn(styles.skeleton, "size-6 rounded-md")} />
          </div>
        </header>

        {/* Main Body Content Skeleton */}
        <main className="flex-1 scroll-fade space-y-6 overflow-y-auto p-8">
          <div className="max-w-3xl space-y-4">
            {/* Page Icon / Cover skeleton */}
            <div className={cn(styles.skeleton, "size-12 rounded-xl")} />

            {/* Document Title */}
            <div className={cn(styles.skeleton, "h-8 w-2/5 rounded-lg")} />

            {/* Content paragraph lines */}
            <div className="space-y-2 pt-4">
              <div className={cn(styles.skeleton, "h-4 w-full rounded-md")} />
              <div className={cn(styles.skeleton, "h-4 w-5/6 rounded-md")} />
              <div className={cn(styles.skeleton, "h-4 w-4/6 rounded-md")} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
