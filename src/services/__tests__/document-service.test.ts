import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentJSON } from "@/types/document";

import { storage } from "@/lib/storage/storage-provider";
import { createNewBlankDocument } from "@/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";

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

    expect(doc.blocks.b1?.properties.checked).toBe(true);

    const saved = mockedStorage.saveDocument.mock.calls[0]?.[0];

    expect(saved.id).toBe("p1");
    expect(saved.blocks.b1?.properties.checked).toBe(true);
  });

  it("updateBlockProperties falls back to the persisted copy when the page is not loaded", async () => {
    const stored = docWithBlock("p2");
    mockedStorage.getDocument.mockResolvedValue(stored);

    await documentService.updateBlockProperties("p2", "b1", { checked: true });

    const saved = mockedStorage.saveDocument.mock.calls[0]?.[0];

    expect(saved.id).toBe("p2");
    expect(saved.blocks.b1?.properties.checked).toBe(true);
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
      store.getState().currentDocument?.blocks.b1?.properties.checked,
    ).toBeUndefined();
  });

  it("deletePageAndSubTree removes the subtree, its documents, blobs, tabs, and sidebar entries", async () => {
    const parentDoc = docWithBlock("p1");

    parentDoc.blocks.b1.properties.blobId = "blob_1";

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
    expect(useSidebarStore.getState().pages.p1).toBeUndefined();
    expect(useSidebarStore.getState().pages.c1).toBeUndefined();
    expect(useSidebarStore.getState().rootPageIds).toEqual([]);
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

    const pageBlock = parentDoc.blocks[parentDoc.blocks.root.childrenIds[0]];

    expect(pageBlock.properties.targetPageId).toBe(newPageId);
    expect(pageBlock.type).toBe("page");
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
    expect(
      savedParent.blocks[savedParent.blocks.root.childrenIds[0]]?.properties
        .targetPageId,
    ).toBe(newPageId);
    expect(useSidebarStore.getState().pages[newPageId]).toMatchObject({
      parentId: "p2",
    });
  });
});
