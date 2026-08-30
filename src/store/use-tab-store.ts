import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ROUTES } from "@/constants/routes";

export interface TabItem {
  id: string; // usually `tab_${pageId}`
  pageId: string;
  workspaceId: string;
  title: string;
  icon?: string;
  isPinned?: boolean;
  lastAccessedAt: number;
}

interface RouterLike {
  push: (href: string) => void;
}

interface TabStoreState {
  tabs: TabItem[];
  activeTabId: string | null;
  hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  openTab: (tab: {
    pageId: string;
    workspaceId: string;
    title?: string;
    icon?: string;
  }) => void;
  closeTab: (tabId: string, router?: RouterLike) => void;
  closeOtherTabs: (tabId: string, router?: RouterLike) => void;
  closeTabsToRight: (tabId: string, router?: RouterLike) => void;
  closeAllTabs: (workspaceId?: string, router?: RouterLike) => void;
  setActiveTabId: (tabId: string) => void;
  togglePinTab: (tabId: string) => void;
  reorderTabs: (sourceIndex: number, destinationIndex: number) => void;
  updateTabInfo: (
    pageId: string,
    partial: { title?: string; icon?: string },
  ) => void;
  removeTabByPageId: (pageId: string, router?: RouterLike) => void;
  cleanupWorkspaceTabs: (workspaceId: string) => void;
}

export const useTabStore = create<TabStoreState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      openTab: ({ pageId, workspaceId, title = "Untitled", icon }) => {
        const state = get();
        const tabId = `tab_${pageId}`;
        const existingTab = state.tabs.find(
          (t) => t.pageId === pageId && t.workspaceId === workspaceId,
        );

        if (existingTab) {
          // Tab already exists, update and activate
          const updatedTabs = state.tabs.map((t) =>
            t.id === existingTab.id
              ? {
                  ...t,
                  title: title || t.title,
                  icon: icon !== undefined ? icon : t.icon,
                  lastAccessedAt: Date.now(),
                }
              : t,
          );
          set({
            tabs: updatedTabs,
            activeTabId: existingTab.id,
          });
          return;
        }

        // Create new tab
        const newTab: TabItem = {
          id: tabId,
          pageId,
          workspaceId,
          title: title || "Untitled",
          icon,
          isPinned: false,
          lastAccessedAt: Date.now(),
        };

        set({
          tabs: [...state.tabs, newTab],
          activeTabId: tabId,
        });
      },

      closeTab: (tabId, router) => {
        const state = get();
        const targetIndex = state.tabs.findIndex((t) => t.id === tabId);
        if (targetIndex === -1) return;

        const targetTab = state.tabs[targetIndex];
        const remainingTabs = state.tabs.filter((t) => t.id !== tabId);

        // If closing the currently active tab
        if (state.activeTabId === tabId) {
          if (remainingTabs.length > 0) {
            // Pick next adjacent tab or previous if at end
            const nextIndex = Math.min(targetIndex, remainingTabs.length - 1);
            const nextActiveTab = remainingTabs[nextIndex];
            set({
              tabs: remainingTabs,
              activeTabId: nextActiveTab.id,
            });

            if (router) {
              router.push(
                `/${ROUTES.workspace}/${nextActiveTab.workspaceId}/${nextActiveTab.pageId}`,
              );
            }
          } else {
            // No tabs left, clear active and navigate to workspace home
            set({
              tabs: [],
              activeTabId: null,
            });

            if (router && targetTab) {
              router.push(`/${ROUTES.workspace}/${targetTab.workspaceId}`);
            }
          }
        } else {
          // Closing a non-active tab
          set({ tabs: remainingTabs });
        }
      },

      closeOtherTabs: (tabId, router) => {
        const state = get();
        const targetTab = state.tabs.find((t) => t.id === tabId);
        if (!targetTab) return;

        // Keep pinned tabs and the target tab
        const preservedTabs = state.tabs.filter(
          (t) => t.id === tabId || t.isPinned,
        );
        set({
          tabs: preservedTabs,
          activeTabId: targetTab.id,
        });

        if (router) {
          router.push(
            `/workspace/${targetTab.workspaceId}/${targetTab.pageId}`,
          );
        }
      },

      closeTabsToRight: (tabId, router) => {
        const state = get();
        const targetIndex = state.tabs.findIndex((t) => t.id === tabId);
        if (targetIndex === -1) return;

        const preservedTabs = state.tabs.filter(
          (t, i) => i <= targetIndex || t.isPinned,
        );
        const isActiveStillOpen = preservedTabs.some(
          (t) => t.id === state.activeTabId,
        );

        if (!isActiveStillOpen) {
          const targetTab = state.tabs[targetIndex];
          set({
            tabs: preservedTabs,
            activeTabId: targetTab.id,
          });

          if (router) {
            router.push(
              `/workspace/${targetTab.workspaceId}/${targetTab.pageId}`,
            );
          }
        } else {
          set({ tabs: preservedTabs });
        }
      },

      closeAllTabs: (workspaceId, router) => {
        const state = get();
        const pinnedTabs = state.tabs.filter(
          (t) => t.isPinned && (!workspaceId || t.workspaceId === workspaceId),
        );

        if (pinnedTabs.length > 0) {
          const firstPinned = pinnedTabs[0];
          set({
            tabs: pinnedTabs,
            activeTabId: firstPinned.id,
          });

          if (router) {
            router.push(
              `/${ROUTES.workspace}/${firstPinned.workspaceId}/${firstPinned.pageId}`,
            );
          }
        } else {
          set({
            tabs: workspaceId
              ? state.tabs.filter((t) => t.workspaceId !== workspaceId)
              : [],
            activeTabId: null,
          });

          if (router && workspaceId) {
            router.push(`/${ROUTES.workspace}/${workspaceId}`);
          }
        }
      },

      setActiveTabId: (tabId) => {
        set({ activeTabId: tabId });
      },

      togglePinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: !t.isPinned } : t,
          ),
        }));
      },

      reorderTabs: (sourceIndex, destinationIndex) => {
        set((state) => {
          const newTabs = [...state.tabs];
          const [movedItem] = newTabs.splice(sourceIndex, 1);
          newTabs.splice(destinationIndex, 0, movedItem);
          return { tabs: newTabs };
        });
      },

      updateTabInfo: (pageId, partial) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.pageId === pageId
              ? {
                  ...t,
                  ...(partial.title !== undefined && {
                    title: partial.title || "Untitled",
                  }),
                  ...(partial.icon !== undefined && { icon: partial.icon }),
                }
              : t,
          ),
        }));
      },

      removeTabByPageId: (pageId, router) => {
        const state = get();
        const targetTab = state.tabs.find((t) => t.pageId === pageId);

        if (targetTab) {
          state.closeTab(targetTab.id, router);
        }
      },

      cleanupWorkspaceTabs: (workspaceId) => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.workspaceId !== workspaceId),
          activeTabId:
            state.activeTabId &&
            state.tabs.find((t) => t.id === state.activeTabId)?.workspaceId ===
              workspaceId
              ? null
              : state.activeTabId,
        }));
      },
    }),
    {
      name: "yaad-document-tabs-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
