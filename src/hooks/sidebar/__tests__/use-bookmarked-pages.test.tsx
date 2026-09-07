import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { useSidebarStore } from "@/store/use-sidebar-store";

import { useBookmarkedPages } from "../use-bookmarked-pages";

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

describe("useBookmarkedPages (Integration Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({
      pages: {
        bookmarked: makePage("bookmarked", { isBookmarked: true }),
        trashed: makePage("trashed", { isBookmarked: true, isDeleted: true }),
        plain: makePage("plain"),
      },
      rootPageIds: ["bookmarked", "plain"],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
  });

  it("returns only pages that are bookmarked and not deleted", () => {
    const { result } = renderHook(() => useBookmarkedPages());

    expect(result.current.map((page) => page.id)).toEqual(["bookmarked"]);
  });

  it("stays in sync when bookmarks change", () => {
    const { result } = renderHook(() => useBookmarkedPages());

    expect(result.current).toHaveLength(1);

    act(() => {
      useSidebarStore.getState().toggleBookmarked("plain");
    });

    expect(result.current.map((page) => page.id)).toEqual([
      "bookmarked",
      "plain",
    ]);
  });
});
