import { describe, expect, it } from "vitest";

import type { DocumentBlockType } from "@/types/document";

import { SLASH_OPTIONS } from "../slash-options";

const VALID_BLOCK_TYPES: DocumentBlockType[] = [
  "bulleted_list",
  "callout",
  "code",
  "column_list",
  "heading_1",
  "heading_2",
  "heading_3",
  "image",
  "link_preview",
  "page",
  "paragraph",
  "quote",
  "table",
  "todo",
];

describe("SLASH_OPTIONS (Unit Test)", () => {
  it("exposes options for the insertable blocks", () => {
    expect(SLASH_OPTIONS.length).toBeGreaterThan(0);
  });

  it("has unique ids and titles", () => {
    expect(new Set(SLASH_OPTIONS.map((option) => option.id)).size).toBe(
      SLASH_OPTIONS.length,
    );
    expect(new Set(SLASH_OPTIONS.map((option) => option.title)).size).toBe(
      SLASH_OPTIONS.length,
    );
  });

  it("only references known document block types", () => {
    for (const option of SLASH_OPTIONS) {
      expect(VALID_BLOCK_TYPES).toContain(option.type);
    }
  });

  it("gives every option a description and an icon", () => {
    for (const option of SLASH_OPTIONS) {
      expect(option.description.length).toBeGreaterThan(0);
      expect(option.icon).toBeDefined();
    }
  });

  it("includes the core blocks users need", () => {
    const ids = SLASH_OPTIONS.map((option) => option.id);

    for (const id of ["text", "h1", "todo", "code", "page", "image"]) {
      expect(ids).toContain(id);
    }
  });
});
