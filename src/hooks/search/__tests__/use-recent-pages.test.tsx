import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { SidebarPageItem } from "@/store/use-sidebar-store";
import type { TabItem } from "@/store/use-tab-store";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { useRecentPages } from "../use-recent-pages";

function makePage(
  id: string,
  overrides: Partial<SidebarPageItem> = {},
): SidebarPageItem {
  return {
    id,
    title: id,
    icon: "📄",
    parentId: null,
    childrenIds: [],
    updatedAt: 1,
    ...overrides,
  };
}

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

const pages: Record<string, SidebarPageItem> = {
  p1: makePage("p1", { title: "P One", icon: "📕", updatedAt: 10 }),
  p2: makePage("p2", { title: "P Two", isDeleted: true }),
  p3: makePage("p3", { title: "P Three", updatedAt: 50 }),
  p9: makePage("p9", { title: "Other WS", updatedAt: 99 }),
};

const tabs: TabItem[] = [
  makeTab("p1", { lastAccessedAt: 300 }),
  makeTab("p2", { lastAccessedAt: 200 }),
  makeTab("p9", { workspaceId: "ws_2", lastAccessedAt: 999 }),
];

describe("useRecentPages (Integration Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({
      pages,
      rootPageIds: ["p1", "p3"],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
    useWorkspaceStore.setState({
      workspaces: {},
      activeWorkspaceId: "ws_1",
      hasHydrated: true,
    });
    useTabStore.setState({ tabs, activeTabId: "tab_p1", hasHydrated: true });
  });

  it("lists open workspace tabs ordered by recency, excluding deleted pages", () => {
    const { result } = renderHook(() => useRecentPages(1));

    expect(result.current.map((item) => item.pageId)).toEqual(["p1"]);

    const first = result.current[0];

    expect(first.category).toBe("recent");
    expect(first.id).toBe("recent_p1");
    expect(first.title).toBe("P One");
    expect(first.icon).toBe("📕");
    expect(first.workspaceId).toBe("ws_1");
  });

  it("supplements recent tabs with sidebar pages when under the limit", () => {
    const { result } = renderHook(() => useRecentPages());

    expect(result.current.map((item) => item.pageId)).toEqual([
      "p1",
      "p9",
      "p3",
    ]);

    const fallback = result.current[2];

    expect(fallback.id).toBe("recent_fallback_p3");
    expect(fallback.title).toBe("P Three");
  });

  it("respects the requested limit", () => {
    const { result } = renderHook(() => useRecentPages(1));

    expect(result.current.map((item) => item.pageId)).toEqual(["p1"]);
  });

  it("scopes to an explicit workspace and skips the fallback for non-active ones", () => {
    const { result } = renderHook(() => useRecentPages(5, "ws_2"));

    expect(result.current.map((item) => item.pageId)).toEqual(["p9"]);
  });

  it("returns no items when no workspace is active", () => {
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    const { result } = renderHook(() => useRecentPages());

    expect(result.current).toEqual([]);
  });
});
