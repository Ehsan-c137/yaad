import type { Tag } from "@yaad/core/types/document";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTagStore } from "../use-tag-store";

vi.mock("@yaad/core/lib/storage/storage-provider", () => {
  let storedTags: any[] = [];
  return {
    storage: {
      getTags: vi.fn(async () => storedTags),
      saveTags: vi.fn(async (tags) => {
        storedTags = tags;
      }),
    },
  };
});

describe("useTagStore (Unit Test)", () => {
  const sampleTag1: Tag = { id: "tag_1", name: "Work", color: "blue" };
  const sampleTag2: Tag = { id: "tag_2", name: "Urgent", color: "red" };
  const sampleTag3: Tag = { id: "tag_3", name: "Personal", color: "green" };

  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }

    useTagStore.setState({
      tags: [],
      _hasHydrated: false,
    });
  });

  it("starts with empty tags array", () => {
    const state = useTagStore.getState();

    expect(state.tags).toEqual([]);
    expect(state._hasHydrated).toBe(false);
  });

  it("adds a new tag with addTag", () => {
    useTagStore.getState().addTag(sampleTag1);

    expect(useTagStore.getState().tags).toEqual([sampleTag1]);
  });

  it("ignores duplicate tag when calling addTag", () => {
    useTagStore.getState().addTag(sampleTag1);
    useTagStore.getState().addTag(sampleTag1);

    expect(useTagStore.getState().tags).toEqual([sampleTag1]);
  });

  it("adds multiple tags with addTags without duplicating existing ones", () => {
    useTagStore.getState().addTag(sampleTag1);
    useTagStore.getState().addTags([sampleTag1, sampleTag2, sampleTag3]);

    expect(useTagStore.getState().tags).toEqual([
      sampleTag1,
      sampleTag2,
      sampleTag3,
    ]);
  });

  it("updates an existing tag's properties with updateTag", () => {
    useTagStore.getState().addTag(sampleTag1);
    useTagStore
      .getState()
      .updateTag("tag_1", { name: "Work Updated", color: "purple" });

    const updatedTag = useTagStore.getState().getTag("tag_1");

    expect(updatedTag).toEqual({
      id: "tag_1",
      name: "Work Updated",
      color: "purple",
    });
  });

  it("removes a tag with removeTag and deleteTag", () => {
    useTagStore.getState().addTags([sampleTag1, sampleTag2]);
    useTagStore.getState().removeTag("tag_1");

    expect(useTagStore.getState().tags).toEqual([sampleTag2]);

    useTagStore.getState().deleteTag("tag_2");

    expect(useTagStore.getState().tags).toEqual([]);
  });

  it("finds a tag by ID and by case-insensitive name", () => {
    useTagStore.getState().addTags([sampleTag1, sampleTag2]);

    expect(useTagStore.getState().getTag("tag_2")).toEqual(sampleTag2);
    expect(useTagStore.getState().getTagByName("urgent")).toEqual(sampleTag2);
    expect(useTagStore.getState().getTagByName("WORK")).toEqual(sampleTag1);
    expect(useTagStore.getState().getTagByName("nonexistent")).toBeUndefined();
  });

  it("replaces tags with setTags and clears with clearTags", () => {
    useTagStore.getState().setTags([sampleTag1, sampleTag3]);

    expect(useTagStore.getState().tags).toEqual([sampleTag1, sampleTag3]);

    useTagStore.getState().clearTags();

    expect(useTagStore.getState().tags).toEqual([]);
  });

  it("updates _hasHydrated via setHasHydrated", () => {
    useTagStore.getState().setHasHydrated(true);

    expect(useTagStore.getState()._hasHydrated).toBe(true);
  });
});
