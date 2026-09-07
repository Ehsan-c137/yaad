import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { usePageSearch } from "../use-page-search";

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

const pages: Record<string, SidebarPageItem> = {
  meeting: makePage("meeting", { title: "Meeting Notes", updatedAt: 2 }),
  draft: makePage("draft", {
    title: "Notes Draft",
    parentId: "meeting",
    updatedAt: 1,
  }),
  archived: makePage("archived", { title: "Notes Archive", isDeleted: true }),
  empty: makePage("empty", { title: "", updatedAt: 3 }),
};

describe("usePageSearch (Integration Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({
      pages,
      rootPageIds: ["meeting", "empty"],
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
  });

  it("returns no results for blank queries", () => {
    const { result } = renderHook(() => usePageSearch("   "));

    expect(result.current).toEqual([]);
  });

  it("returns no results without an active workspace", () => {
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    const { result } = renderHook(() => usePageSearch("notes"));

    expect(result.current).toEqual([]);
  });

  it("matches titles case-insensitively and skips deleted pages", () => {
    const { result } = renderHook(() => usePageSearch("NoTeS"));
    const pageIds = result.current.map((item) => item.pageId);

    expect(pageIds).toContain("meeting");
    expect(pageIds).toContain("draft");
    expect(pageIds).not.toContain("archived");
  });

  it("decorates results with search ids, icons, and parent subtitles", () => {
    const { result } = renderHook(() => usePageSearch("notes draft"));
    const draft = result.current[0];

    expect(draft.id).toBe("search_page_draft");
    expect(draft.category).toBe("page");
    expect(draft.title).toBe("Notes Draft");
    expect(draft.subtitle).toBe("In Meeting Notes");
    expect(draft.icon).toBe("📄");
    expect(draft.workspaceId).toBe("ws_1");
    expect(draft.lastAccessedAt).toBe(1);
  });

  it("labels pages without a title as Untitled", () => {
    const { result } = renderHook(() => usePageSearch("untitled"));

    expect(result.current[0]?.pageId).toBe("empty");
    expect(result.current[0]?.title).toBe("Untitled");
  });

  it("returns nothing when no page matches", () => {
    const { result } = renderHook(() => usePageSearch("zzz"));

    expect(result.current).toEqual([]);
  });
});
