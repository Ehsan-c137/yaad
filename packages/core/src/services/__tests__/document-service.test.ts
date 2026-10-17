/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/require-await, @typescript-eslint/no-non-null-asserted-optional-chain */
import type { DocumentJSON } from "@yaad/core/types/document";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { createNewBlankDocument } from "@yaad/core/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { documentService } from "../document-service";

vi.mock("@/lib/storage/storage-provider", () => ({
  storage: {
    getWorkspaces: vi.fn(),
    saveWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    getWorkspaceTree: vi.fn(),
    saveWorkspaceTree: vi.fn(),
    getDocument: vi.fn(),
    saveDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getBlob: vi.fn(),
    saveBlob: vi.fn(),
    removeBlob: vi.fn(),
  },
}));

const mockedStorage = vi.mocked(storage);

function docWithBlock(id: string): DocumentJSON {
  const doc = createNewBlankDocument(id);

  doc.blocks.b1 = {
    id: "b1",
    type: "paragraph",
    parentId: "root",
    childrenIds: [],
    properties: { title: [{ text: "First" }] },
    createdAt: 0,
    updatedAt: 0,
  };
  doc.blocks.root.childrenIds = ["b1"];

  return doc;
}

describe("DocumentService (Integration Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedStorage.getDocument.mockResolvedValue(null);
    mockedStorage.saveDocument.mockResolvedValue(undefined);
    mockedStorage.deleteDocument.mockResolvedValue(undefined);
    mockedStorage.removeBlob.mockResolvedValue(undefined);
    localStorage.clear();
    useSidebarStore.setState({
      pages: {},
      rootPageIds: [],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
    useTabStore.setState({ tabs: [], activeTabId: null, hasHydrated: true });
  });

  afterEach(() => {
    removeDocumentStore("p1");
    removeDocumentStore("p2");
  });

  it("loadDocument returns the stored document when it exists", async () => {
    const stored = docWithBlock("p1");
    mockedStorage.getDocument.mockResolvedValue(stored);

    await expect(documentService.loadDocument("p1")).resolves.toBe(stored);
    expect(mockedStorage.saveDocument).not.toHaveBeenCalled();
  });

  it("loadDocument creates and persists a blank document when missing", async () => {
    const created = await documentService.loadDocument("p1");

    expect(created).toMatchObject({
      id: "p1",
      title: "Untitled",
      rootBlockId: "root",
    });
    expect(created.blocks.root.type).toBe("page");
    expect(mockedStorage.saveDocument).toHaveBeenCalledWith(created);
  });

  it("saveDocument delegates to the storage adapter", async () => {
    const doc = docWithBlock("p1");

    await documentService.saveDocument(doc);

    expect(mockedStorage.saveDocument).toHaveBeenCalledWith(doc);
  });

  it("blob helpers delegate and deleteBlobs removes every id", async () => {
    const blob = new Blob(["x"]);

    await documentService.saveBlob("b1", blob);
    await documentService.getBlob("b1");
    await documentService.deleteBlobs(["a", "b"]);

    expect(mockedStorage.saveBlob).toHaveBeenCalledWith("b1", blob);
    expect(mockedStorage.getBlob).toHaveBeenCalledWith("b1");
    expect(mockedStorage.removeBlob).toHaveBeenCalledWith("a");
    expect(mockedStorage.removeBlob).toHaveBeenCalledWith("b");
  });

  it("updateBlockProperties patches the loaded document store and persists", async () => {
    const store = getDocumentStore("p1");

    store.setState({
      currentDocument: docWithBlock("p1"),
      _hasHydrated: true,
    });

    await documentService.updateBlockProperties("p1", "b1", { checked: true });

    const doc = store.getState().currentDocument!;

    expect(doc.blocks.b1?.properties?.checked).toBe(true);

    const saved = mockedStorage.saveDocument.mock.calls[0]?.[0];

    expect(saved.id).toBe("p1");
    expect(saved.blocks.b1?.properties?.checked).toBe(true);
  });

  it("updateBlockProperties falls back to the persisted copy when the page is not loaded", async () => {
    const stored = docWithBlock("p2");
    mockedStorage.getDocument.mockResolvedValue(stored);

    await documentService.updateBlockProperties("p2", "b1", { checked: true });

    const saved = mockedStorage.saveDocument.mock.calls[0]?.[0];

    expect(saved.id).toBe("p2");
    expect(saved.blocks.b1?.properties?.checked).toBe(true);
  });

  it("updateBlockProperties no-ops without ids, missing blocks, or missing docs", async () => {
    const store = getDocumentStore("p1");

    store.setState({
      currentDocument: docWithBlock("p1"),
      _hasHydrated: true,
    });

    await documentService.updateBlockProperties("", "b1", { checked: true });
    await documentService.updateBlockProperties("p1", "", { checked: true });
    await documentService.updateBlockProperties("p1", "ghost", {
      checked: true,
    });
    await documentService.updateBlockProperties("p-missing", "b1", {
      checked: true,
    });

    expect(mockedStorage.saveDocument).not.toHaveBeenCalled();
    expect(
      store.getState().currentDocument?.blocks.b1?.properties?.checked,
    ).toBeUndefined();
  });

  it("moveBlock reorders blocks in loaded store and persists", async () => {
    const doc = docWithBlock("p1");

    doc.blocks.b2 = {
      childrenIds: [],
      createdAt: 0,
      id: "b2",
      parentId: "root",
      properties: {},
      tags: [],
      type: "text",
      updatedAt: 0,
    };
    doc.blocks.root.childrenIds = ["b1", "b2"];

    const store = getDocumentStore("p1");

    store.setState({ currentDocument: doc, _hasHydrated: true });

    await documentService.moveBlock("p1", {
      position: "before",
      sourceBlockId: "b2",
      targetBlockId: "b1",
    });

    const updated = store.getState().currentDocument!;

    expect(updated.blocks.root.childrenIds).toEqual(["b2", "b1"]);
  });

  it("moveBlock falls back to persisted document when not loaded", async () => {
    const doc = docWithBlock("p2");

    doc.blocks.b2 = {
      childrenIds: [],
      createdAt: 0,
      id: "b2",
      parentId: "root",
      properties: {},
      tags: [],
      type: "text",
      updatedAt: 0,
    };
    doc.blocks.root.childrenIds = ["b1", "b2"];

    mockedStorage.getDocument.mockResolvedValue(doc);

    await documentService.moveBlock("p2", {
      position: "after",
      sourceBlockId: "b1",
      targetBlockId: "b2",
    });

    const saved = mockedStorage.saveDocument.mock.calls.at(-1)?.[0];

    expect(saved?.blocks.root.childrenIds).toEqual(["b2", "b1"]);
  });

  it("deletePageAndSubTree removes the subtree, its documents, blobs, tabs, and sidebar entries", async () => {
    const parentDoc = docWithBlock("p1");

    parentDoc.blocks.b1.properties!.blobId = "blob_1";

    const childDoc = createNewBlankDocument("c1");

    mockedStorage.getDocument.mockImplementation(async (id: string) =>
      id === "p1" ? parentDoc : childDoc,
    );
    useSidebarStore.setState({
      pages: {
        p1: {
          id: "p1",
          title: "P1",
          icon: "📄",
          parentId: null,
          childrenIds: ["c1"],
          isExpanded: true,
        },
        c1: {
          id: "c1",
          title: "C1",
          icon: "📄",
          parentId: "p1",
          childrenIds: [],
        },
      },
      rootPageIds: ["p1"],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
    useTabStore.setState({
      tabs: [
        {
          id: "tab_p1",
          pageId: "p1",
          workspaceId: "ws_1",
          title: "P1",
          isPinned: false,
          lastAccessedAt: 0,
        },
      ],
      activeTabId: "tab_p1",
      hasHydrated: true,
    });

    await documentService.deletePageAndSubTree("p1");

    expect(mockedStorage.deleteDocument).toHaveBeenCalledWith("p1");
    expect(mockedStorage.deleteDocument).toHaveBeenCalledWith("c1");
    expect(mockedStorage.removeBlob).toHaveBeenCalledWith("blob_1");
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });

  it("deletePageAndSubTree clears the in-memory document of deleted pages", async () => {
    const store = getDocumentStore("p1");

    store.setState({ currentDocument: docWithBlock("p1"), _hasHydrated: true });

    await documentService.deletePageAndSubTree("p1");

    expect(store.getState().currentDocument).toBeNull();
  });

  it("deletePageAndSubTree ignores falsy ids", async () => {
    await documentService.deletePageAndSubTree("");

    expect(mockedStorage.deleteDocument).not.toHaveBeenCalled();
  });

  it("createSubPage creates the child document, links the parent block, and registers the tree entry", async () => {
    useSidebarStore.setState({
      pages: {
        p1: {
          id: "p1",
          title: "P1",
          icon: "📄",
          parentId: null,
          childrenIds: [],
        },
      },
      rootPageIds: ["p1"],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
    getDocumentStore("p1").setState({
      currentDocument: createNewBlankDocument("p1"),
      _hasHydrated: true,
    });

    const newPageId = await documentService.createSubPage("p1", "Sub");

    expect(newPageId).toMatch(/^page_/);
    expect(mockedStorage.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: newPageId, title: "Sub" }),
    );
    expect(useSidebarStore.getState().pages[newPageId]).toMatchObject({
      title: "Sub",
      parentId: "p1",
    });
    expect(useSidebarStore.getState().pages.p1?.isExpanded).toBe(true);

    const parentDoc = getDocumentStore("p1").getState().currentDocument!;

    expect(parentDoc.blocks.root.childrenIds).toHaveLength(1);

    const childId = parentDoc.blocks.root.childrenIds[0];
    const pageBlock = parentDoc.blocks[childId];

    expect(pageBlock?.properties?.targetPageId).toBe(newPageId);
    expect(pageBlock?.type).toBe("page");
  });

  it("createSubPage patches the persisted parent when it is not loaded", async () => {
    useSidebarStore.setState({
      pages: {
        p2: {
          id: "p2",
          title: "P2",
          icon: "📄",
          parentId: null,
          childrenIds: [],
        },
      },
      rootPageIds: ["p2"],
      isLoading: false,
      activePageId: null,
      isSidebarOpen: true,
      _hasHydrated: true,
    });
    mockedStorage.getDocument.mockResolvedValue(createNewBlankDocument("p2"));

    const newPageId = await documentService.createSubPage("p2", "Sub");

    const savedCalls = mockedStorage.saveDocument.mock.calls;
    const savedParent = savedCalls.at(-1)?.[0]!;

    expect(savedParent.id).toBe("p2");
    expect(savedParent.blocks.root.childrenIds).toHaveLength(1);

    const savedChildId = savedParent.blocks.root.childrenIds[0];

    expect(savedParent.blocks[savedChildId]?.properties?.targetPageId).toBe(
      newPageId,
    );
    expect(useSidebarStore.getState().pages[newPageId]).toMatchObject({
      parentId: "p2",
    });
  });

  it("attachSubPageBlock creates a page block in loaded store and positions it", async () => {
    getDocumentStore("p1").setState({
      currentDocument: createNewBlankDocument("p1"),
      _hasHydrated: true,
    });

    await documentService.attachSubPageBlock("p1", "child_1", {
      title: "Child 1",
      icon: "📗",
      position: "inside",
    });

    const doc = getDocumentStore("p1").getState().currentDocument!;
    expect(doc.blocks.root.childrenIds).toHaveLength(1);
    const blockId = doc.blocks.root.childrenIds[0];
    expect(doc.blocks[blockId]).toMatchObject({
      type: "page",
      properties: {
        title: [{ text: "Child 1" }],
        targetPageId: "child_1",
        icon: "📗",
      },
    });
  });

  it("attachSubPageBlock falls back to sidebar store title and icon when options omit them", async () => {
    useSidebarStore.setState({
      pages: {
        child_page: {
          id: "child_page",
          title: "Sidebar Title",
          icon: "🌟",
          parentId: null,
          childrenIds: [],
        },
      },
    });

    getDocumentStore("p1").setState({
      currentDocument: createNewBlankDocument("p1"),
      _hasHydrated: true,
    });

    await documentService.attachSubPageBlock("p1", "child_page");

    const doc = getDocumentStore("p1").getState().currentDocument!;
    const blockId = doc.blocks.root.childrenIds[0];

    expect(doc.blocks[blockId]?.properties).toMatchObject({
      icon: "🌟",
      targetPageId: "child_page",
      title: [{ text: "Sidebar Title" }],
    });
  });

  it("attachSubPageBlock reorders existing block when position is before or after sibling", async () => {
    const doc = createNewBlankDocument("p1");
    doc.blocks.b_s1 = {
      id: "b_s1",
      type: "page",
      parentId: "root",
      childrenIds: [],
      properties: { targetPageId: "sub_1", title: [{ text: "Sub 1" }] },
      createdAt: 0,
      updatedAt: 0,
    };
    doc.blocks.b_s2 = {
      id: "b_s2",
      type: "page",
      parentId: "root",
      childrenIds: [],
      properties: { targetPageId: "sub_2", title: [{ text: "Sub 2" }] },
      createdAt: 0,
      updatedAt: 0,
    };
    doc.blocks.root.childrenIds = ["b_s1", "b_s2"];

    getDocumentStore("p1").setState({
      currentDocument: doc,
      _hasHydrated: true,
    });

    // Move sub_2 before sub_1
    await documentService.attachSubPageBlock("p1", "sub_2", {
      position: "before",
      targetSiblingPageId: "sub_1",
    });

    const updated = getDocumentStore("p1").getState().currentDocument!;
    expect(updated.blocks.root.childrenIds).toEqual(["b_s2", "b_s1"]);
  });

  it("removeSubPageBlock deletes the page block from loaded document and root children", async () => {
    const doc = createNewBlankDocument("p1");
    doc.blocks.b_sub = {
      id: "b_sub",
      type: "page",
      parentId: "root",
      childrenIds: [],
      properties: { targetPageId: "sub_x", title: [{ text: "Sub X" }] },
      createdAt: 0,
      updatedAt: 0,
    };
    doc.blocks.root.childrenIds = ["b_sub"];

    getDocumentStore("p1").setState({
      currentDocument: doc,
      _hasHydrated: true,
    });

    await documentService.removeSubPageBlock("p1", "sub_x");

    const updated = getDocumentStore("p1").getState().currentDocument!;
    expect(updated.blocks.root.childrenIds).toEqual([]);
    expect(updated.blocks.b_sub).toBeUndefined();
  });

  it("moveSubPageBlock unlinks from old parent and attaches to new parent", async () => {
    const doc1 = createNewBlankDocument("p1");
    doc1.blocks.b_sub = {
      id: "b_sub",
      type: "page",
      parentId: "root",
      childrenIds: [],
      properties: { targetPageId: "sub_moving", title: [{ text: "Moving" }] },
      createdAt: 0,
      updatedAt: 0,
    };
    doc1.blocks.root.childrenIds = ["b_sub"];

    const doc2 = createNewBlankDocument("p2");

    getDocumentStore("p1").setState({
      currentDocument: doc1,
      _hasHydrated: true,
    });
    getDocumentStore("p2").setState({
      currentDocument: doc2,
      _hasHydrated: true,
    });

    await documentService.moveSubPageBlock("sub_moving", "p1", "p2", {
      title: "Moving",
      icon: "🚀",
      position: "inside",
    });

    const updated1 = getDocumentStore("p1").getState().currentDocument!;
    expect(updated1.blocks.root.childrenIds).toEqual([]);
    expect(updated1.blocks.b_sub).toBeUndefined();

    const updated2 = getDocumentStore("p2").getState().currentDocument!;
    expect(updated2.blocks.root.childrenIds).toHaveLength(1);
    const newBlockId = updated2.blocks.root.childrenIds[0];
    expect(updated2.blocks[newBlockId]).toMatchObject({
      type: "page",
      properties: {
        targetPageId: "sub_moving",
        title: [{ text: "Moving" }],
        icon: "🚀",
      },
    });
  });
});
