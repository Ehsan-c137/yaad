import { ROUTES } from "@yaad/core/constants/routes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { removeDocumentStore } from "./document/use-document-store";

export const DEFAULT_TAB_TITLE = "Untitled";

export interface TabItem {
  id: string; // usually `tab_${pageId}`
  pageId: string;
  workspaceId: string;
  title: string;
  icon?: string;
  isPinned?: boolean;
  lastAccessedAt: number;
}

export interface RouterLike {
  push: (href: string) => void;
}

export interface OpenTabInput {
  pageId: string;
  workspaceId: string;
  title?: string;
  icon?: string;
}

export interface UpdateTabInfoInput {
  title?: string;
  icon?: string;
}

interface NavigationTarget {
  workspaceId: string;
  pageId?: string;
}

interface TabMutationResult {
  tabs: TabItem[];
  activeTabId: string | null;
  evictedTabs: TabItem[];
  navigationTarget?: NavigationTarget;
}

export interface TabStoreState {
  tabs: TabItem[];
  activeTabId: string | null;
  hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  openTab: (tab: OpenTabInput) => void;
  closeTab: (tabId: string, router?: RouterLike) => void;
  closeOtherTabs: (tabId: string, router?: RouterLike) => void;
  closeTabsToRight: (tabId: string, router?: RouterLike) => void;
  closeAllTabs: (workspaceId?: string, router?: RouterLike) => void;
  setActiveTabId: (tabId: string) => void;
  togglePinTab: (tabId: string) => void;
  reorderTabs: (sourceIndex: number, destinationIndex: number) => void;
  updateTabInfo: (pageId: string, partial: UpdateTabInfoInput) => void;
  removeTabByPageId: (pageId: string, router?: RouterLike) => void;
  cleanupWorkspaceTabs: (workspaceId: string) => void;
}

export const useTabStore = create<TabStoreState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      openTab: (tabInput) => {
        const { tabs, activeTabId } = resolveOpenTab(get().tabs, tabInput);
        set({ tabs, activeTabId });
      },

      closeTab: (tabId, router) => {
        const { tabs, activeTabId } = get();
        const result = resolveCloseTab(tabs, activeTabId, tabId);
        if (!result) return;

        evictTabs(result.evictedTabs);
        set({ tabs: result.tabs, activeTabId: result.activeTabId });
        navigate(router, result.navigationTarget);
      },

      closeOtherTabs: (tabId, router) => {
        const result = resolveCloseOtherTabs(get().tabs, tabId);
        if (!result) return;

        evictTabs(result.evictedTabs);
        set({ tabs: result.tabs, activeTabId: result.activeTabId });
        navigate(router, result.navigationTarget);
      },

      closeTabsToRight: (tabId, router) => {
        const { tabs, activeTabId } = get();
        const result = resolveCloseTabsToRight(tabs, activeTabId, tabId);
        if (!result) return;

        evictTabs(result.evictedTabs);
        set({ tabs: result.tabs, activeTabId: result.activeTabId });
        navigate(router, result.navigationTarget);
      },

      closeAllTabs: (workspaceId, router) => {
        const result = resolveCloseAllTabs(get().tabs, workspaceId);

        evictTabs(result.evictedTabs);
        set({ tabs: result.tabs, activeTabId: result.activeTabId });
        navigate(router, result.navigationTarget);
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
        set((state) => ({
          tabs: reorderTabList(state.tabs, sourceIndex, destinationIndex),
        }));
      },

      updateTabInfo: (pageId, partial) => {
        set((state) => ({
          tabs: state.tabs.map((t) => {
            if (t.pageId !== pageId) return t;

            return {
              ...t,
              ...(partial.title !== undefined && {
                title: partial.title || DEFAULT_TAB_TITLE,
              }),
              ...(partial.icon !== undefined && { icon: partial.icon }),
            };
          }),
        }));
      },

      removeTabByPageId: (pageId, router) => {
        const targetTab = get().tabs.find((t) => t.pageId === pageId);

        if (targetTab) {
          get().closeTab(targetTab.id, router);
        }
      },

      cleanupWorkspaceTabs: (workspaceId) => {
        const { tabs, activeTabId } = get();
        const result = resolveCleanupWorkspaceTabs(
          tabs,
          activeTabId,
          workspaceId,
        );

        evictTabs(result.evictedTabs);
        set({ tabs: result.tabs, activeTabId: result.activeTabId });
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

export function createTabId(pageId: string): string {
  return `tab_${pageId}`;
}

function navigate(router?: RouterLike, target?: NavigationTarget) {
  if (!router || !target) return;

  const path = target.pageId
    ? `/${ROUTES.workspace}/${target.workspaceId}/${target.pageId}`
    : `/${ROUTES.workspace}/${target.workspaceId}`;

  router.push(path);
}

function evictTabs(tabs: readonly TabItem[]) {
  for (const tab of tabs) {
    removeDocumentStore(tab.pageId);
  }
}

function resolveOpenTab(
  tabs: TabItem[],
  input: OpenTabInput,
  now = Date.now(),
): { tabs: TabItem[]; activeTabId: string } {
  const { pageId, workspaceId, title = DEFAULT_TAB_TITLE, icon } = input;
  const existingTab = tabs.find(
    (t) => t.pageId === pageId && t.workspaceId === workspaceId,
  );

  if (existingTab) {
    return {
      tabs: tabs.map((t) =>
        t.id === existingTab.id
          ? {
              ...t,
              title: title || t.title,
              icon: icon ?? t.icon,
              lastAccessedAt: now,
            }
          : t,
      ),
      activeTabId: existingTab.id,
    };
  }

  const newTab: TabItem = {
    id: createTabId(pageId),
    pageId,
    workspaceId,
    title: title || DEFAULT_TAB_TITLE,
    icon,
    isPinned: false,
    lastAccessedAt: now,
  };

  return {
    tabs: [...tabs, newTab],
    activeTabId: newTab.id,
  };
}

function resolveCloseTab(
  tabs: TabItem[],
  activeTabId: string | null,
  tabId: string,
): TabMutationResult | null {
  const targetIndex = tabs.findIndex((t) => t.id === tabId);
  if (targetIndex === -1) return null;

  const targetTab = tabs[targetIndex];
  const remainingTabs = tabs.filter((t) => t.id !== tabId);

  if (activeTabId !== tabId) {
    return {
      tabs: remainingTabs,
      activeTabId,
      evictedTabs: [targetTab],
    };
  }

  if (remainingTabs.length > 0) {
    const nextIndex = Math.min(targetIndex, remainingTabs.length - 1);
    const nextActiveTab = remainingTabs[nextIndex];
    return {
      tabs: remainingTabs,
      activeTabId: nextActiveTab.id,
      evictedTabs: [targetTab],
      navigationTarget: {
        workspaceId: nextActiveTab.workspaceId,
        pageId: nextActiveTab.pageId,
      },
    };
  }

  return {
    tabs: [],
    activeTabId: null,
    evictedTabs: [targetTab],
    navigationTarget: {
      workspaceId: targetTab.workspaceId,
    },
  };
}

function resolveCloseOtherTabs(
  tabs: TabItem[],
  tabId: string,
): TabMutationResult | null {
  const targetTab = tabs.find((t) => t.id === tabId);
  if (!targetTab) return null;

  return {
    tabs: tabs.filter((t) => t.id === tabId || t.isPinned),
    activeTabId: targetTab.id,
    evictedTabs: tabs.filter((t) => t.id !== tabId && !t.isPinned),
    navigationTarget: {
      workspaceId: targetTab.workspaceId,
      pageId: targetTab.pageId,
    },
  };
}

function resolveCloseTabsToRight(
  tabs: TabItem[],
  activeTabId: string | null,
  tabId: string,
): TabMutationResult | null {
  const targetIndex = tabs.findIndex((t) => t.id === tabId);
  if (targetIndex === -1) return null;

  const targetTab = tabs[targetIndex];
  const preservedTabs = tabs.filter((t, i) => i <= targetIndex || t.isPinned);
  const isActiveStillOpen = preservedTabs.some((t) => t.id === activeTabId);

  return {
    tabs: preservedTabs,
    activeTabId: isActiveStillOpen ? activeTabId : targetTab.id,
    evictedTabs: tabs.filter((t, i) => i > targetIndex && !t.isPinned),
    navigationTarget: isActiveStillOpen
      ? undefined
      : {
          workspaceId: targetTab.workspaceId,
          pageId: targetTab.pageId,
        },
  };
}

function resolveCloseAllTabs(
  tabs: TabItem[],
  workspaceId?: string,
): TabMutationResult {
  const matchesWorkspace = (t: TabItem) =>
    !workspaceId || t.workspaceId === workspaceId;

  const pinnedTabs = tabs.filter((t) => t.isPinned && matchesWorkspace(t));

  if (pinnedTabs.length > 0) {
    const firstPinned = pinnedTabs[0];
    return {
      tabs: pinnedTabs,
      activeTabId: firstPinned.id,
      evictedTabs: tabs.filter((t) => !t.isPinned && matchesWorkspace(t)),
      navigationTarget: {
        workspaceId: firstPinned.workspaceId,
        pageId: firstPinned.pageId,
      },
    };
  }

  return {
    tabs: workspaceId ? tabs.filter((t) => t.workspaceId !== workspaceId) : [],
    activeTabId: null,
    evictedTabs: tabs.filter((t) => !t.isPinned && matchesWorkspace(t)),
    navigationTarget: workspaceId ? { workspaceId } : undefined,
  };
}

function resolveCleanupWorkspaceTabs(
  tabs: TabItem[],
  activeTabId: string | null,
  workspaceId: string,
): { tabs: TabItem[]; activeTabId: string | null; evictedTabs: TabItem[] } {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const shouldResetActive = activeTab?.workspaceId === workspaceId;

  return {
    tabs: tabs.filter((t) => t.workspaceId !== workspaceId),
    activeTabId: shouldResetActive ? null : activeTabId,
    evictedTabs: tabs.filter((t) => t.workspaceId === workspaceId),
  };
}

function reorderTabList(
  tabs: TabItem[],
  sourceIndex: number,
  destinationIndex: number,
): TabItem[] {
  if (
    sourceIndex < 0 ||
    sourceIndex >= tabs.length ||
    destinationIndex < 0 ||
    destinationIndex >= tabs.length ||
    sourceIndex === destinationIndex
  ) {
    return tabs;
  }

  const nextTabs = [...tabs];
  const [movedItem] = nextTabs.splice(sourceIndex, 1);

  nextTabs.splice(destinationIndex, 0, movedItem);

  return nextTabs;
}
