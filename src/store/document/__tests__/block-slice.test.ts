import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentJSON } from "@/types/document";

import { documentService } from "@/services/document-service";

import { createNewBlankDocument } from "../helpers";
import { getDocumentStore, removeDocumentStore } from "../use-document-store";

vi.mock("@/services/document-service", () => ({
  documentService: {
    loadDocument: vi.fn(),
    saveDocument: vi.fn(),
    deletePageAndSubTree: vi.fn(),
    updateBlockProperties: vi.fn(),
    createSubPage: vi.fn(),
    getBlob: vi.fn(),
    saveBlob: vi.fn(),
    deleteBlobs: vi.fn(),
  },
}));

const mockedDocumentService = vi.mocked(documentService);

const pageId = "page-blocks";

function makeDoc(): DocumentJSON {
  return {
    ...createNewBlankDocument(pageId),
    blocks: {
      root: {
        id: "root",
        type: "page",
        parentId: null,
        childrenIds: ["b1"],
        properties: { title: [{ text: "Untitled" }] },
        createdAt: 0,
        updatedAt: 0,
      },
      b1: {
        id: "b1",
        type: "paragraph",
        parentId: "root",
        childrenIds: [],
        properties: { title: [{ text: "First" }] },
        createdAt: 0,
        updatedAt: 0,
      },
    },
  };
}

describe("document block-slice (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    mockedDocumentService.saveDocument.mockResolvedValue(undefined);
    mockedDocumentService.deletePageAndSubTree.mockResolvedValue(undefined);
    mockedDocumentService.deleteBlobs.mockResolvedValue(undefined);
    mockedDocumentService.createSubPage.mockResolvedValue("page_new");
    getDocumentStore(pageId).setState({
      currentDocument: makeDoc(),
      isSaving: false,
      _hasHydrated: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    removeDocumentStore(pageId);
  });

  it("addBlock inserts after the given block and schedules a debounced save", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().addBlock("root", "b1", "paragraph");

    const doc = store.getState().currentDocument!;
    const { childrenIds } = doc.blocks.root;

    expect(childrenIds).toHaveLength(2);
    expect(childrenIds[0]).toBe("b1");

    const newBlock = doc.blocks[childrenIds[1]];

    expect(newBlock).toMatchObject({ type: "paragraph", parentId: "root" });
    expect(store.getState().isSaving).toBe(true);

    await vi.advanceTimersByTimeAsync(500);

    expect(mockedDocumentService.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId }),
    );
    expect(store.getState().isSaving).toBe(false);
  });

  it("addBlock appends at the end when the anchor block is unknown", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().addBlock("root", "ghost", "paragraph");

    const { childrenIds } = store.getState().currentDocument!.blocks.root;

    expect(childrenIds).toHaveLength(2);
    expect(childrenIds[0]).toBe("b1");
  });

  it("addBlock wires page blocks to a freshly created sub-page", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().addBlock("root", "b1", "page");

    expect(mockedDocumentService.createSubPage).toHaveBeenCalledWith(
      pageId,
      "Untitled",
    );

    const doc = store.getState().currentDocument!;
    const newBlock = doc.blocks[doc.blocks.root.childrenIds[1]];

    expect(newBlock.type).toBe("page");
    expect(newBlock.properties.targetPageId).toMatch(/^page_/);
    expect(newBlock.properties.icon).toBe("📄");
  });

  it("deleteBlock removes the block, unlinks it, and saves immediately", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().deleteBlock("b1");

    const doc = store.getState().currentDocument!;

    expect(doc.blocks.b1).toBeUndefined();
    expect(doc.blocks.root.childrenIds).toEqual([]);
    expect(mockedDocumentService.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId }),
    );
    expect(store.getState().isSaving).toBe(false);
  });

  it("deleteBlock cascades into children and deletes linked sub-pages", async () => {
    const store = getDocumentStore(pageId);
    const doc = makeDoc();

    doc.blocks.p1 = {
      id: "p1",
      type: "page",
      parentId: "root",
      childrenIds: ["p2"],
      properties: { title: [{ text: "Sub" }], targetPageId: "page_target" },
      createdAt: 0,
      updatedAt: 0,
    };
    doc.blocks.p2 = {
      id: "p2",
      type: "paragraph",
      parentId: "p1",
      childrenIds: [],
      properties: {},
      createdAt: 0,
      updatedAt: 0,
    };
    doc.blocks.root.childrenIds = ["b1", "p1"];
    store.setState({ currentDocument: doc });

    await store.getState().deleteBlock("p1");

    const updated = store.getState().currentDocument!;

    expect(updated.blocks.p1).toBeUndefined();
    expect(updated.blocks.p2).toBeUndefined();
    expect(mockedDocumentService.deletePageAndSubTree).toHaveBeenCalledWith(
      "page_target",
    );
  });

  it("deleteBlock removes the media blobs of deleted blocks", async () => {
    const store = getDocumentStore(pageId);
    const doc = makeDoc();

    doc.blocks.b1.properties.blobId = "blob_1";
    store.setState({ currentDocument: doc });

    await store.getState().deleteBlock("b1");

    const blobSet = mockedDocumentService.deleteBlobs.mock
      .calls[0]?.[0] as Set<string>;

    expect(blobSet.has("blob_1")).toBe(true);
  });

  it("deleteBlock guards the root block", async () => {
    const store = getDocumentStore(pageId);
    const before = store.getState().currentDocument;

    await store.getState().deleteBlock("root");

    expect(store.getState().currentDocument).toBe(before);
    expect(mockedDocumentService.saveDocument).not.toHaveBeenCalled();
  });

  it("duplicateBlock copies a block right after the original", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().duplicateBlock("b1");

    await vi.advanceTimersByTimeAsync(500);

    const doc = store.getState().currentDocument!;
    const { childrenIds } = doc.blocks.root;

    expect(childrenIds).toHaveLength(2);

    const duplicate = doc.blocks[childrenIds[1]];

    expect(duplicate.id).not.toBe("b1");
    expect(duplicate.properties.title).toEqual([{ text: "First" }]);
    expect(mockedDocumentService.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId }),
    );
  });

  it("duplicateBlock leaves the document unchanged for the root block", async () => {
    const store = getDocumentStore(pageId);
    const before = store.getState().currentDocument;

    await store.getState().duplicateBlock("root");

    await vi.advanceTimersByTimeAsync(500);

    // The slice still schedules its debounced save, but the document keeps
    // the same reference and content.
    expect(store.getState().currentDocument).toBe(before);
    expect(mockedDocumentService.saveDocument).toHaveBeenCalledWith(before);
  });

  it("changeBlockType turns a text block into a sub-page block", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().changeBlockType("b1", "page");

    const block = store.getState().currentDocument!.blocks.b1;

    expect(block.type).toBe("page");
    expect(block.properties.targetPageId).toMatch(/^page_/);
    expect(block.properties.icon).toBe("📄");
    expect(mockedDocumentService.saveDocument).toHaveBeenCalledTimes(2);
  });

  it("changeBlockType turns a page block back into text and deletes the sub-page", async () => {
    const store = getDocumentStore(pageId);
    const doc = makeDoc();

    doc.blocks.b1 = {
      ...doc.blocks.b1,
      type: "page",
      properties: {
        title: [{ text: "Sub" }],
        targetPageId: "page_target",
        icon: "📄",
      },
    };
    store.setState({ currentDocument: doc });

    await store.getState().changeBlockType("b1", "paragraph");

    const block = store.getState().currentDocument!.blocks.b1;

    expect(block.type).toBe("paragraph");
    expect(block.properties.targetPageId).toBeUndefined();
    expect(block.properties.icon).toBeUndefined();
    expect(mockedDocumentService.deletePageAndSubTree).toHaveBeenCalledWith(
      "page_target",
    );
  });

  it("changeBlockType no-ops on the same type", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().changeBlockType("b1", "paragraph");

    expect(mockedDocumentService.saveDocument).not.toHaveBeenCalled();
  });

  it("changeBlockType no-ops for unknown blocks", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().changeBlockType("ghost", "todo");

    expect(mockedDocumentService.saveDocument).not.toHaveBeenCalled();
  });

  it("addSubPageBlock delegates to the document service", async () => {
    const result = await getDocumentStore(pageId)
      .getState()
      .addSubPageBlock("p1");

    expect(result).toBe("page_new");
    expect(mockedDocumentService.createSubPage).toHaveBeenCalledWith(
      "p1",
      "Untitled",
    );
  });

  it("addSubPageBlock returns null without a parent page id", async () => {
    const result = await getDocumentStore(pageId)
      .getState()
      .addSubPageBlock("");

    expect(result).toBeNull();
    expect(mockedDocumentService.createSubPage).not.toHaveBeenCalled();
  });
});
