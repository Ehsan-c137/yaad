import type { Tag } from "@yaad/core/types/document";

import { renderHook } from "@testing-library/react";
import { useTagStore } from "@yaad/core/store/use-tag-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { beforeEach, describe, expect, it } from "vitest";

import { useTagSearch } from "../use-tag-search";

const testTags: Tag[] = [
  { id: "tag_1", name: "Work", color: "blue" },
  { id: "tag_2", name: "Personal", color: "green" },
  { id: "tag_3", name: "Urgent Work", color: "red" },
];

describe("useTagSearch", () => {
  beforeEach(() => {
    useTagStore.setState({
      tags: testTags,
      _hasHydrated: true,
    });
    useWorkspaceStore.setState({
      workspaces: {},
      activeWorkspaceId: "ws_1",
      hasHydrated: true,
    });
  });

  it("returns no items for blank queries", () => {
    const { result } = renderHook(() => useTagSearch("   "));

    expect(result.current).toEqual([]);
  });

  it("returns matching tags case-insensitively", () => {
    const { result } = renderHook(() => useTagSearch("work"));

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.title)).toEqual([
      "#Work",
      "#Urgent Work",
    ]);
  });

  it("strips leading '#' prefix", () => {
    const { result } = renderHook(() => useTagSearch("#personal"));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.title).toBe("#Personal");
    expect(result.current[0]?.category).toBe("tag");
    expect(result.current[0]?.tag?.id).toBe("tag_2");
  });

  it("returns empty list if only '#' is entered", () => {
    const { result } = renderHook(() => useTagSearch("#"));

    expect(result.current).toEqual([]);
  });

  it("returns empty list when no tags match query", () => {
    const { result } = renderHook(() => useTagSearch("nonexistent"));

    expect(result.current).toEqual([]);
  });
});
