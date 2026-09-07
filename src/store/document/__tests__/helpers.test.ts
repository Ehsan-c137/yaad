import { describe, expect, it } from "vitest";

import type { DocumentBlock, DocumentJSON } from "@/types/document";

import {
  applyBlockProperties,
  collectSubTreeForDeletion,
  createNewBlankDocument,
} from "../helpers";

function makeBlock(
  id: string,
  type: DocumentBlock["type"],
  parentId: string | null,
  childrenIds: string[],
  properties: Record<string, unknown> = {},
): DocumentBlock {
  return {
    id,
    type,
    parentId,
    childrenIds,
    properties,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("createNewBlankDocument (Unit Test)", () => {
  it("creates a valid blank document shell for the given id", () => {
    const doc = createNewBlankDocument("page_1");

    expect(doc).toMatchObject({
      version: 1,
      id: "page_1",
      title: "Untitled",
      rootBlockId: "root",
      icon: "📄",
    });
    expect(doc.blocks.root).toMatchObject({
      id: "root",
      type: "page",
      parentId: null,
      childrenIds: [],
    });
    expect(doc.blocks.root.properties.title).toEqual([{ text: "Untitled" }]);
    expect(typeof doc.createdAt).toBe("number");
    expect(typeof doc.updatedAt).toBe("number");
  });

  it("creates independent documents per call", () => {
    const first = createNewBlankDocument("page_1");
    const second = createNewBlankDocument("page_2");

    expect(first.blocks.root).not.toBe(second.blocks.root);
    expect(second.id).toBe("page_2");
  });
});

describe("applyBlockProperties (Unit Test)", () => {
  const baseDoc: DocumentJSON = {
    ...createNewBlankDocument("page_1"),
    blocks: {
      root: makeBlock("root", "page", null, ["target"], {
        title: [{ text: "Untitled" }],
      }),
      target: makeBlock("target", "todo", "root", [], {
        title: [{ text: "Task" }],
        checked: false,
      }),
    },
  };

  it("merges new properties into the target block and bumps timestamps", () => {
    const updated = applyBlockProperties(baseDoc, "target", { checked: true });

    expect(updated).not.toBe(baseDoc);
    expect(updated.blocks.target?.properties).toEqual({
      title: [{ text: "Task" }],
      checked: true,
    });
    expect(updated.blocks.target?.updatedAt).toBeGreaterThanOrEqual(
      baseDoc.blocks.target?.updatedAt ?? 0,
    );
    expect(updated.updatedAt).toBeGreaterThanOrEqual(baseDoc.updatedAt);
  });

  it("keeps untouched blocks and properties by reference or value", () => {
    const updated = applyBlockProperties(baseDoc, "target", { checked: true });

    expect(updated.blocks.root).toBe(baseDoc.blocks.root);
    expect(updated.blocks.target?.properties.title).toBe(
      baseDoc.blocks.target?.properties.title,
    );
  });

  it("returns the same document reference when the block does not exist", () => {
    const result = applyBlockProperties(baseDoc, "missing", { a: 1 });

    expect(result).toBe(baseDoc);
  });
});

describe("collectSubTreeForDeletion (Unit Test)", () => {
  const blocks: Record<string, DocumentBlock> = {
    root: makeBlock("root", "page", null, ["a", "b"], {
      title: [{ text: "Untitled" }],
    }),
    a: makeBlock("a", "todo", "root", ["a1"], { blobId: "blob_1" }),
    a1: makeBlock("a1", "paragraph", "a", [], { blobId: "blob_1" }),
    b: makeBlock("b", "paragraph", "root", []),
  };

  it("collects the full subtree and unique blob ids", () => {
    const { blocksToDelete, blobsToDelete } = collectSubTreeForDeletion(
      "a",
      blocks,
    );

    expect([...blocksToDelete].sort()).toEqual(["a", "a1"]);
    expect([...blobsToDelete]).toEqual(["blob_1"]);
  });

  it("collects a single block when it has no children", () => {
    const { blocksToDelete, blobsToDelete } = collectSubTreeForDeletion(
      "b",
      blocks,
    );

    expect([...blocksToDelete]).toEqual(["b"]);
    expect(blobsToDelete.size).toBe(0);
  });

  it("returns empty sets for an unknown start block", () => {
    const { blocksToDelete, blobsToDelete } = collectSubTreeForDeletion(
      "ghost",
      blocks,
    );

    expect(blocksToDelete.size).toBe(0);
    expect(blobsToDelete.size).toBe(0);
  });

  it("terminates on cyclic parent/child references", () => {
    const cyclic: Record<string, DocumentBlock> = {
      x: makeBlock("x", "todo", null, ["y"]),
      y: makeBlock("y", "todo", "x", ["x"]),
    };

    const { blocksToDelete } = collectSubTreeForDeletion("x", cyclic);

    expect(blocksToDelete.size).toBe(2);
  });
});
