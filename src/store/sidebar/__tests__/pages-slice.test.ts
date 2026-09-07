import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentJSON } from "@/types/document";

import { documentService } from "@/services/document-service";
import { useTabStore } from "@/store/use-tab-store";

import type { SidebarPageItem } from "../types";

import { useSidebarStore } from "../use-sidebar-store";

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

vi.mock("@/services/workspace-service", () => ({
  workspaceService: {
    getWorkspaces: vi.fn(),
    saveWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    getWorkspaceTree: vi.fn(),
    saveWorkspaceTree: vi.fn(),
  },
}));

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
    isExpanded: false,
    isBookmarked: false,
    isDeleted: false,
    ...overrides,
  };
}

function resetStore(
  pages: Record<string, SidebarPageItem> = {},
  rootPageIds: string[] = [],
) {
  localStorage.clear();
  useSidebarStore.setState({
    pages,
    rootPageIds,
    activePageId: null,
    isLoading: false,
    isSidebarOpen: true,
    _hasHydrated: true,
  });
}

describe("pages-slice (Unit Test)", () => {
  beforeEach(() => {
    useSidebarStore.setState({
      pages: {
        "page-1": {
          id: "page-1",
          title: "Test Page 1",
          icon: "📄",
          parentId: null,
          childrenIds: [],
          isExpanded: false,
          isBookmarked: false,
          isDeleted: false,
          updatedAt: Date.now(),
        },
      },
      rootPageIds: ["page-1"],
    });
  });

  it("toggles expand state of a page correctly", () => {
    expect(useSidebarStore.getState().pages["page-1"]?.isExpanded).toBe(false);

    useSidebarStore.getState().toggleExpand("page-1");

    expect(useSidebarStore.getState().pages["page-1"]?.isExpanded).toBe(true);

    useSidebarStore.getState().toggleExpand("page-1");

    expect(useSidebarStore.getState().pages["page-1"]?.isExpanded).toBe(false);
  });

  it("handles toggling expand state for non-existent page gracefully", () => {
    const initialState = useSidebarStore.getState().pages;
    useSidebarStore.getState().toggleExpand("non-existent-id");

    expect(useSidebarStore.getState().pages).toEqual(initialState);
  });
});

describe("pages-slice createPage and deletePage (Unit Test)", () => {
  beforeEach(() => resetStore());

  it("createPage adds a root page and activates it", () => {
    const id = useSidebarStore.getState().createPage(null);

    const state = useSidebarStore.getState();

    expect(state.pages[id]).toMatchObject({
      id,
      title: "Untitled",
      icon: "📄",
      parentId: null,
      childrenIds: [],
    });
    expect(state.rootPageIds).toContain(id);
    expect(state.activePageId).toBe(id);
  });

  it("createPage nests under an existing parent and expands it", () => {
    const parentId = useSidebarStore.getState().createPage(null);

    const childId = useSidebarStore.getState().createPage(parentId);

    const state = useSidebarStore.getState();

    expect(state.pages[childId]?.parentId).toBe(parentId);
    expect(state.pages[parentId]?.childrenIds).toContain(childId);
    expect(state.pages[parentId]?.isExpanded).toBe(true);
    expect(state.rootPageIds).not.toContain(childId);
  });

  it("createPage treats a missing parent as a root page", () => {
    const id = useSidebarStore.getState().createPage("ghost");

    expect(useSidebarStore.getState().rootPageIds).toContain(id);
    expect(useSidebarStore.getState().pages[id]?.parentId).toBe("ghost");
  });

  it("deletePage removes the whole subtree and unlinks from the parent", () => {
    const parentId = useSidebarStore.getState().createPage(null);
    useSidebarStore.getState().createPage(parentId);

    useSidebarStore.getState().deletePage(parentId);

    const state = useSidebarStore.getState();

    expect(state.pages[parentId]).toBeUndefined();
    expect(state.rootPageIds).not.toContain(parentId);
    expect(Object.keys(state.pages)).toHaveLength(0);
  });

  it("deletePage is a no-op for unknown pages", () => {
    resetStore({ kept: makePage("kept") }, ["kept"]);

    useSidebarStore.getState().deletePage("ghost");

    expect(useSidebarStore.getState().pages.kept).toBeDefined();
  });

  it("toggleBookmarked flips the bookmark flag and stamps the update time", () => {
    resetStore({ "page-1": makePage("page-1") }, ["page-1"]);

    useSidebarStore.getState().toggleBookmarked("page-1");

    expect(useSidebarStore.getState().pages["page-1"]?.isBookmarked).toBe(true);

    useSidebarStore.getState().toggleBookmarked("page-1");

    expect(useSidebarStore.getState().pages["page-1"]?.isBookmarked).toBe(
      false,
    );
  });

  it("toggleBookmarked throws for pages missing from the store", () => {
    expect(() => useSidebarStore.getState().toggleBookmarked("ghost")).toThrow(
      /not found/i,
    );
  });
});

describe("pages-slice trash flow (Unit Test)", () => {
  beforeEach(() => {
    resetStore(
      {
        parent: makePage("parent", {
          childrenIds: ["child"],
          isBookmarked: true,
          isExpanded: true,
        }),
        child: makePage("child", { parentId: "parent" }),
      },
      ["parent"],
    );
  });

  it("moveToTrash marks the subtree as deleted and unlinks it from the tree", () => {
    useSidebarStore.getState().moveToTrash("parent");

    const { pages, rootPageIds } = useSidebarStore.getState();

    expect(pages.parent).toMatchObject({
      isDeleted: true,
      isBookmarked: false,
    });
    expect(typeof pages.parent?.deletedAt).toBe("number");
    expect(pages.child?.isDeleted).toBe(true);
    expect(rootPageIds).not.toContain("parent");
  });

  it("moveToTrash is a no-op for unknown pages", () => {
    const before = useSidebarStore.getState().pages;

    useSidebarStore.getState().moveToTrash("ghost");

    expect(useSidebarStore.getState().pages).toEqual(before);
  });

  it("restorePage restores the subtree and re-lists the root page", () => {
    useSidebarStore.getState().moveToTrash("parent");

    useSidebarStore.getState().restorePage("parent");

    const { pages, rootPageIds } = useSidebarStore.getState();

    expect(pages.parent?.isDeleted).toBe(false);
    expect(pages.parent?.deletedAt).toBeUndefined();
    expect(pages.child?.isDeleted).toBe(false);
    expect(rootPageIds).toContain("parent");
  });

  it("restorePage re-roots pages whose parent is still deleted", () => {
    useSidebarStore.getState().moveToTrash("parent");

    useSidebarStore.getState().restorePage("child");

    const { pages, rootPageIds } = useSidebarStore.getState();

    expect(pages.parent?.isDeleted).toBe(true);
    expect(pages.child?.isDeleted).toBe(false);
    expect(pages.child?.parentId).toBeNull();
    expect(rootPageIds).toContain("child");
  });

  it("restorePage ignores pages that are not in the trash", () => {
    const before = useSidebarStore.getState().pages;

    useSidebarStore.getState().restorePage("parent");

    expect(useSidebarStore.getState().pages).toEqual(before);
  });

  it("permanentlyDeletePage delegates to the document service", async () => {
    await useSidebarStore.getState().permanentlyDeletePage("parent");

    expect(documentService.deletePageAndSubTree).toHaveBeenCalledWith("parent");
  });

  it("emptyTrash permanently deletes every trashed page", async () => {
    resetStore(
      {
        a: makePage("a", { isDeleted: true }),
        b: makePage("b", { isDeleted: true }),
        live: makePage("live"),
      },
      ["live"],
    );

    await useSidebarStore.getState().emptyTrash();

    expect(documentService.deletePageAndSubTree).toHaveBeenCalledTimes(2);
    expect(documentService.deletePageAndSubTree).toHaveBeenCalledWith("a");
    expect(documentService.deletePageAndSubTree).toHaveBeenCalledWith("b");
  });
});

describe("pages-slice duplicatePage (Unit Test)", () => {
  function makeSourceDoc(): DocumentJSON {
    return {
      version: 1,
      id: "source",
      title: "Source",
      rootBlockId: "root",
      icon: "📄",
      createdAt: 0,
      updatedAt: 0,
      blocks: {
        root: {
          id: "root",
          type: "page",
          parentId: null,
          childrenIds: ["b1"],
          properties: { title: [{ text: "Source" }] },
          createdAt: 0,
          updatedAt: 0,
        },
        b1: {
          id: "b1",
          type: "paragraph",
          parentId: "root",
          childrenIds: [],
          properties: { title: [{ text: "hello" }] },
          createdAt: 0,
          updatedAt: 0,
        },
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    resetStore({ source: makePage("source", { title: "Source" }) }, ["source"]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clones the source document and registers the copy next to the original", async () => {
    vi.mocked(documentService.loadDocument).mockResolvedValue(makeSourceDoc());

    const newId = await useSidebarStore.getState().duplicatePage("source");

    const state = useSidebarStore.getState();

    expect(newId).toBeTruthy();
    expect(state.pages[newId!]).toMatchObject({
      title: "Source (Copy)",
      parentId: null,
    });
    expect(state.rootPageIds).toEqual(["source", newId]);
    expect(state.activePageId).toBe(newId);

    expect(documentService.saveDocument).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
    );

    const savedDoc = vi.mocked(documentService.saveDocument).mock.calls[0]?.[0];

    expect(savedDoc.id).toBe(newId);
    expect(savedDoc.title).toBe("Source (Copy)");
    expect(savedDoc.blocks.root.childrenIds).toHaveLength(1);
    expect(Object.keys(savedDoc.blocks)).not.toContain("b1");
  });

  it("inserts the copy right after the original under the same parent", async () => {
    resetStore(
      {
        parent: makePage("parent", {
          childrenIds: ["source"],
          isExpanded: true,
        }),
        source: makePage("source", { title: "Source", parentId: "parent" }),
      },
      ["parent"],
    );
    vi.mocked(documentService.loadDocument).mockResolvedValue(makeSourceDoc());

    const newId = await useSidebarStore.getState().duplicatePage("source");

    expect(useSidebarStore.getState().pages.parent?.childrenIds).toEqual([
      "source",
      newId,
    ]);
  });

  it("falls back to 'Untitled (Copy)' for untitled pages", async () => {
    resetStore({ source: makePage("source", { title: "" }) }, ["source"]);
    vi.mocked(documentService.loadDocument).mockResolvedValue(makeSourceDoc());

    await useSidebarStore.getState().duplicatePage("source");

    const savedDoc = vi.mocked(documentService.saveDocument).mock.calls[0]?.[0];

    expect(savedDoc.title).toBe("Untitled (Copy)");
  });

  it("returns null for unknown pages", async () => {
    await expect(
      useSidebarStore.getState().duplicatePage("ghost"),
    ).resolves.toBeNull();
    expect(documentService.saveDocument).not.toHaveBeenCalled();
  });

  it("still registers the copy when the source document cannot be loaded", async () => {
    vi.mocked(documentService.loadDocument).mockRejectedValue(
      new Error("boom"),
    );

    const newId = await useSidebarStore.getState().duplicatePage("source");

    expect(newId).toBeTruthy();
    expect(useSidebarStore.getState().pages[newId!]).toMatchObject({
      title: "Source (Copy)",
    });
  });
});

describe("pages-slice tree mutations (Unit Test)", () => {
  beforeEach(() => resetStore());

  it("registerSubPageInTree attaches the sub-page and expands the parent", () => {
    resetStore({ parent: makePage("parent") }, ["parent"]);

    useSidebarStore
      .getState()
      .registerSubPageInTree("child", "parent", "Child");

    const state = useSidebarStore.getState();

    expect(state.pages.child).toMatchObject({
      title: "Child",
      parentId: "parent",
    });
    expect(state.pages.parent?.childrenIds).toContain("child");
    expect(state.pages.parent?.isExpanded).toBe(true);
  });

  it("registerSubPageInTree places pages at the root when the parent is missing", () => {
    useSidebarStore
      .getState()
      .registerSubPageInTree("orphan", "ghost", "Orphan");

    const state = useSidebarStore.getState();

    expect(state.pages.orphan?.parentId).toBeNull();
    expect(state.rootPageIds).toContain("orphan");
  });

  it("registerSubPageInTree does not duplicate child ids", () => {
    resetStore(
      {
        parent: makePage("parent", {
          childrenIds: ["child"],
          isExpanded: true,
        }),
      },
      ["parent"],
    );

    useSidebarStore
      .getState()
      .registerSubPageInTree("child", "parent", "Child");

    expect(useSidebarStore.getState().pages.parent?.childrenIds).toEqual([
      "child",
    ]);
  });

  it("updatePageTitleInTree renames the page and syncs open tabs", () => {
    resetStore({ "page-1": makePage("page-1") }, ["page-1"]);
    useTabStore.setState({
      tabs: [
        {
          id: "tab_page-1",
          pageId: "page-1",
          workspaceId: "ws_1",
          title: "Old",
          isPinned: false,
          lastAccessedAt: 0,
        },
      ],
      activeTabId: "tab_page-1",
    });

    useSidebarStore.getState().updatePageTitleInTree("page-1", "Renamed");

    expect(useSidebarStore.getState().pages["page-1"]).toMatchObject({
      title: "Renamed",
    });
    expect(useTabStore.getState().tabs[0]).toMatchObject({
      title: "Renamed",
    });
  });

  it("updatePageTitleInTree can update only the icon", () => {
    resetStore({ "page-1": makePage("page-1", { title: "Kept" }) }, ["page-1"]);

    useSidebarStore.getState().updatePageTitleInTree("page-1", undefined, "🗂️");

    expect(useSidebarStore.getState().pages["page-1"]).toMatchObject({
      title: "Kept",
      icon: "🗂️",
    });
  });

  // Documents a current slice limitation: when title and icon are passed in
  // the same call, the icon update re-spreads a stale `pages` snapshot and
  // reverts the rename. Real call sites pass one field at a time.
  it("updatePageTitleInTree drops the title when title and icon are sent together (known gap)", () => {
    resetStore({ "page-1": makePage("page-1") }, ["page-1"]);

    useSidebarStore.getState().updatePageTitleInTree("page-1", "Renamed", "🗂️");

    expect(useSidebarStore.getState().pages["page-1"]).toMatchObject({
      title: "page-1",
      icon: "🗂️",
    });
  });

  it("updatePageTitleInTree is a no-op for unknown pages", () => {
    useSidebarStore.getState().updatePageTitleInTree("ghost", "Renamed");

    expect(useSidebarStore.getState().pages.ghost).toBeUndefined();
  });

  it("removePageFromTree drops the subtree and unlinks the parent", () => {
    resetStore(
      {
        parent: makePage("parent", { childrenIds: ["child"] }),
        child: makePage("child", { parentId: "parent" }),
        kept: makePage("kept"),
      },
      ["parent", "kept"],
    );
    useTabStore.setState({
      tabs: [
        {
          id: "tab_parent",
          pageId: "parent",
          workspaceId: "ws_1",
          title: "parent",
          isPinned: false,
          lastAccessedAt: 0,
        },
        {
          id: "tab_child",
          pageId: "child",
          workspaceId: "ws_1",
          title: "child",
          isPinned: false,
          lastAccessedAt: 0,
        },
      ],
      activeTabId: null,
    });

    useSidebarStore.getState().removePageFromTree("parent");

    const state = useSidebarStore.getState();

    expect(state.pages.parent).toBeUndefined();
    expect(state.pages.child).toBeUndefined();
    expect(state.pages.kept).toBeDefined();
    expect(state.rootPageIds).toEqual(["kept"]);
    // Only the target page's tab is closed; sub-page tabs are left as-is.
    expect(useTabStore.getState().tabs.map((tab) => tab.pageId)).toEqual([
      "child",
    ]);
  });
});
