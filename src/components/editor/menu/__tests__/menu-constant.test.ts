import { describe, expect, it } from "vitest";

import type { DocumentBlockType } from "@/types/document";

import { COLOR_OPTIONS, TURN_INTO_OPTIONS } from "../menu-constant";

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

describe("TURN_INTO_OPTIONS (Unit Test)", () => {
  it("offers the standard turn-into targets", () => {
    const types = TURN_INTO_OPTIONS.map((option) => option.type);

    for (const type of [
      "paragraph",
      "heading_1",
      "heading_2",
      "heading_3",
      "todo",
      "bulleted_list",
      "code",
      "quote",
    ]) {
      expect(types).toContain(type);
    }
  });

  it("only references known document block types with labels and icons", () => {
    for (const option of TURN_INTO_OPTIONS) {
      expect(VALID_BLOCK_TYPES).toContain(option.type);
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.icon).toBeDefined();
    }
  });
});

describe("COLOR_OPTIONS (Unit Test)", () => {
  it("has unique color names including the default", () => {
    const names = COLOR_OPTIONS.map((option) => option.name);

    expect(names[0]).toBe("Default");
    expect(new Set(names).size).toBe(names.length);
  });

  it("pairs every color with text and background classes", () => {
    for (const option of COLOR_OPTIONS) {
      expect(option.textClass.length).toBeGreaterThan(0);
      expect(option.bgClass.length).toBeGreaterThan(0);
    }
  });
});
