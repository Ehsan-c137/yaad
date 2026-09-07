import { describe, expect, it } from "vitest";

import type { DocumentBlock } from "@/types/document";

import {
  getBlockIcon,
  getBlockLastEditedBy,
  getBlockPageId,
  getBlockSidePeekDocId,
  getBlockTitle,
} from "../block-metadata";

function createBlock(properties: DocumentBlock["properties"]): DocumentBlock {
  return {
    id: "block-1",
    type: "page",
    parentId: "root",
    childrenIds: [],
    properties,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("block-metadata (Unit Test)", () => {
  it("returns the first rich text segment as the block title", () => {
    const block = createBlock({
      title: [{ text: "Hello" }, { text: "World" }],
    });

    expect(getBlockTitle(block)).toBe("Hello");
  });

  it("falls back to 'Untitled' only when the title is missing", () => {
    expect(getBlockTitle(createBlock({}))).toBe("Untitled");
    expect(getBlockTitle(createBlock({ title: [] }))).toBe("Untitled");
    expect(getBlockTitle(createBlock({ title: [{ text: "" }] }))).toBe("");
  });

  it("returns the block icon when present", () => {
    expect(getBlockIcon(createBlock({ icon: "📄" }))).toBe("📄");
    expect(getBlockIcon(createBlock({}))).toBeUndefined();
  });

  it("prefers pageId over targetPageId and block id", () => {
    expect(
      getBlockPageId(createBlock({ pageId: "a", targetPageId: "b" })),
    ).toBe("a");
    expect(getBlockPageId(createBlock({ targetPageId: "b" }))).toBe("b");
    expect(getBlockPageId(createBlock({}))).toBe("block-1");
  });

  it("returns targetPageId for side peek documents, falling back to block id", () => {
    expect(getBlockSidePeekDocId(createBlock({ targetPageId: "target" }))).toBe(
      "target",
    );
    expect(getBlockSidePeekDocId(createBlock({}))).toBe("block-1");
  });

  it("falls back to 'You' when lastEditedBy is missing", () => {
    expect(getBlockLastEditedBy(createBlock({ lastEditedBy: "Alex" }))).toBe(
      "Alex",
    );
    expect(getBlockLastEditedBy(createBlock({}))).toBe("You");
  });
});
