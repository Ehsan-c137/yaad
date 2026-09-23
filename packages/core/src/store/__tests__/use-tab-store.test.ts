import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TabItem } from "../use-tab-store";

import { useTabStore } from "../use-tab-store";

function makeTab(pageId: string, overrides: Partial<TabItem> = {}): TabItem {
  return {
    id: `tab_${pageId}`,
    pageId,
    workspaceId: "ws_1",
    title: pageId,
    isPinned: false,
    lastAccessedAt: 0,
    ...overrides,
  };
}

function makeRouter() {
  return { push: vi.fn() };
}

describe("useTabStore (Unit Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useTabStore.setState({ tabs: [], activeTabId: null, hasHydrated: false });
  });

  describe("openTab", () => {
    it("creates and activates a new tab with a default title", () => {
      useTabStore.getState().openTab({ pageId: "p1", workspaceId: "ws_1" });

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toMatchObject({
        id: "tab_p1",
        pageId: "p1",
        workspaceId: "ws_1",
        title: "Untitled",
        isPinned: false,
      });
      expect(activeTabId).toBe("tab_p1");
    });

    it("reuses an existing tab for the same page and workspace", () => {
      useTabStore.getState().openTab({
        pageId: "p1",
        workspaceId: "ws_1",
        title: "First",
        icon: "📕",
      });
      useTabStore
        .getState()
        .openTab({ pageId: "p1", workspaceId: "ws_1", title: "Second" });

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toMatchObject({ title: "Second", icon: "📕" });
      expect(activeTabId).toBe("tab_p1");
    });

    it("keeps tabs of other workspaces separate", () => {
      useTabStore.getState().openTab({ pageId: "p1", workspaceId: "ws_1" });
      useTabStore.getState().openTab({ pageId: "p1", workspaceId: "ws_2" });

      expect(useTabStore.getState().tabs).toHaveLength(2);
    });
  });

  describe("closeTab", () => {
    it("activates the next adjacent tab when closing the active middle tab", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2"), makeTab("p3")],
        activeTabId: "tab_p2",
      });
      const router = makeRouter();

      useTabStore.getState().closeTab("tab_p2", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p1", "p3"]);
      expect(activeTabId).toBe("tab_p3");
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1/p3");
    });

    it("activates the previous tab when closing the active last tab", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2")],
        activeTabId: "tab_p2",
      });

      useTabStore.getState().closeTab("tab_p2");

      expect(useTabStore.getState().activeTabId).toBe("tab_p1");
    });

    it("clears the state and routes to the workspace home when the last tab closes", () => {
      useTabStore.setState({ tabs: [makeTab("p1")], activeTabId: "tab_p1" });
      const router = makeRouter();

      useTabStore.getState().closeTab("tab_p1", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs).toHaveLength(0);
      expect(activeTabId).toBeNull();
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1");
    });

    it("keeps the active tab when closing a background tab", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2")],
        activeTabId: "tab_p2",
      });
      const router = makeRouter();

      useTabStore.getState().closeTab("tab_p1", router);

      expect(useTabStore.getState().activeTabId).toBe("tab_p2");
      expect(router.push).not.toHaveBeenCalled();
    });

    it("ignores unknown tab ids", () => {
      useTabStore.setState({ tabs: [makeTab("p1")], activeTabId: "tab_p1" });

      useTabStore.getState().closeTab("tab_ghost");

      expect(useTabStore.getState().tabs).toHaveLength(1);
    });
  });

  describe("closeOtherTabs", () => {
    it("keeps the target and pinned tabs and activates the target", () => {
      useTabStore.setState({
        tabs: [makeTab("p1", { isPinned: true }), makeTab("p2"), makeTab("p3")],
        activeTabId: "tab_p2",
      });
      const router = makeRouter();

      useTabStore.getState().closeOtherTabs("tab_p2", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p1", "p2"]);
      expect(activeTabId).toBe("tab_p2");
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1/p2");
    });

    it("ignores unknown tab ids", () => {
      useTabStore.setState({ tabs: [makeTab("p1")], activeTabId: "tab_p1" });

      useTabStore.getState().closeOtherTabs("tab_ghost");

      expect(useTabStore.getState().tabs).toHaveLength(1);
    });
  });

  describe("closeTabsToRight", () => {
    it("removes tabs to the right and activates the target when the active tab closes", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2"), makeTab("p3")],
        activeTabId: "tab_p3",
      });
      const router = makeRouter();

      useTabStore.getState().closeTabsToRight("tab_p1", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p1"]);
      expect(activeTabId).toBe("tab_p1");
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1/p1");
    });

    it("keeps pinned tabs to the right of the target", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2", { isPinned: true }), makeTab("p3")],
        activeTabId: "tab_p3",
      });

      useTabStore.getState().closeTabsToRight("tab_p1");

      expect(useTabStore.getState().tabs.map((t) => t.pageId)).toEqual([
        "p1",
        "p2",
      ]);
    });

    it("keeps the active tab when it survives", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2"), makeTab("p3")],
        activeTabId: "tab_p1",
      });
      const router = makeRouter();

      useTabStore.getState().closeTabsToRight("tab_p1", router);

      expect(useTabStore.getState().activeTabId).toBe("tab_p1");
      expect(router.push).not.toHaveBeenCalled();
    });
  });

  describe("closeAllTabs", () => {
    it("clears everything when no workspace is given", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2", { workspaceId: "ws_2" })],
        activeTabId: "tab_p1",
      });

      useTabStore.getState().closeAllTabs();

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs).toHaveLength(0);
      expect(activeTabId).toBeNull();
    });

    it("removes only the given workspace tabs when nothing is pinned", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2", { workspaceId: "ws_2" })],
        activeTabId: "tab_p1",
      });
      const router = makeRouter();

      useTabStore.getState().closeAllTabs("ws_1", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p2"]);
      expect(activeTabId).toBeNull();
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1");
    });

    it("keeps only the workspace pinned tabs when they exist", () => {
      useTabStore.setState({
        tabs: [
          makeTab("p1"),
          makeTab("p2", { isPinned: true }),
          makeTab("p3", { isPinned: true, workspaceId: "ws_2" }),
        ],
        activeTabId: "tab_p1",
      });
      const router = makeRouter();

      useTabStore.getState().closeAllTabs("ws_1", router);

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p2"]);
      expect(activeTabId).toBe("tab_p2");
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1/p2");
    });
  });

  describe("tab utilities", () => {
    it("toggles the pinned state", () => {
      useTabStore.setState({ tabs: [makeTab("p1")] });

      useTabStore.getState().togglePinTab("tab_p1");

      expect(useTabStore.getState().tabs[0]?.isPinned).toBe(true);

      useTabStore.getState().togglePinTab("tab_p1");

      expect(useTabStore.getState().tabs[0]?.isPinned).toBe(false);
    });

    it("reorders tabs", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2"), makeTab("p3")],
      });

      useTabStore.getState().reorderTabs(0, 2);

      expect(useTabStore.getState().tabs.map((t) => t.pageId)).toEqual([
        "p2",
        "p3",
        "p1",
      ]);
    });

    it("updates the title of tabs for a page, defaulting to Untitled", () => {
      useTabStore.setState({
        tabs: [makeTab("p1", { title: "Old", icon: "📕" })],
      });

      useTabStore.getState().updateTabInfo("p1", { title: "New" });

      expect(useTabStore.getState().tabs[0]).toMatchObject({
        title: "New",
        icon: "📕",
      });

      useTabStore.getState().updateTabInfo("p1", { title: "" });

      expect(useTabStore.getState().tabs[0]?.title).toBe("Untitled");

      useTabStore.getState().updateTabInfo("p1", { icon: "📗" });

      expect(useTabStore.getState().tabs[0]).toMatchObject({
        title: "Untitled",
        icon: "📗",
      });
    });

    it("removes a tab by page id and routes when it was active", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2")],
        activeTabId: "tab_p1",
      });
      const router = makeRouter();

      useTabStore.getState().removeTabByPageId("p1", router);

      expect(useTabStore.getState().tabs.map((t) => t.pageId)).toEqual(["p2"]);
      expect(router.push).toHaveBeenCalledWith("/workspace/ws_1/p2");
    });

    it("does nothing when removing a tab for an unknown page", () => {
      useTabStore.setState({ tabs: [makeTab("p1")], activeTabId: "tab_p1" });

      useTabStore.getState().removeTabByPageId("ghost");

      expect(useTabStore.getState().tabs).toHaveLength(1);
    });

    it("cleans up workspace tabs and resets the active tab when needed", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2", { workspaceId: "ws_2" })],
        activeTabId: "tab_p1",
      });

      useTabStore.getState().cleanupWorkspaceTabs("ws_1");

      const { tabs, activeTabId } = useTabStore.getState();

      expect(tabs.map((t) => t.pageId)).toEqual(["p2"]);
      expect(activeTabId).toBeNull();
    });

    it("keeps the active tab when it belongs to another workspace", () => {
      useTabStore.setState({
        tabs: [makeTab("p1"), makeTab("p2", { workspaceId: "ws_2" })],
        activeTabId: "tab_p2",
      });

      useTabStore.getState().cleanupWorkspaceTabs("ws_1");

      expect(useTabStore.getState().activeTabId).toBe("tab_p2");
    });

    it("sets the active tab and hydration flags directly", () => {
      useTabStore.getState().setActiveTabId("tab_x");
      useTabStore.getState().setHasHydrated(true);

      const state = useTabStore.getState();

      expect(state.activeTabId).toBe("tab_x");
      expect(state.hasHydrated).toBe(true);
    });
  });
});
