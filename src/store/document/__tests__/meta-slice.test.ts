import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { documentService } from "@/services/document-service";
import { useSidebarStore } from "@/store/use-sidebar-store";

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

const mockedSaveDocument = vi.mocked(documentService.saveDocument);

const pageId = "page-meta";

describe("document meta-slice (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    mockedSaveDocument.mockResolvedValue(undefined);
    getDocumentStore(pageId).setState({
      currentDocument: createNewBlankDocument(pageId),
      isSaving: false,
      _hasHydrated: true,
    });
    useSidebarStore.setState({
      pages: {
        [pageId]: {
          id: pageId,
          title: "Untitled",
          icon: "📄",
          parentId: null,
          childrenIds: [],
        },
      },
      rootPageIds: [pageId],
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    removeDocumentStore(pageId);
  });

  it("updateTitle renames the document, root block, and sidebar tree", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().updateTitle("New Title");

    const doc = store.getState().currentDocument;

    expect(doc?.title).toBe("New Title");
    expect(doc?.blocks.root.properties.title).toEqual([{ text: "New Title" }]);
    expect(useSidebarStore.getState().pages[pageId]?.title).toBe("New Title");
    expect(store.getState().isSaving).toBe(true);

    await vi.advanceTimersByTimeAsync(500);

    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId, title: "New Title" }),
    );
    expect(store.getState().isSaving).toBe(false);
  });

  it("coalesces rapid title updates into a single save", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().updateTitle("First");
    await store.getState().updateTitle("Second");

    await vi.advanceTimersByTimeAsync(500);

    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId, title: "Second" }),
    );
    expect(mockedSaveDocument.mock.calls[0]?.[0]).toMatchObject({
      title: "Second",
    });
  });

  it("updateCoverImage sets the cover on the document and root block and saves immediately", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().updateCoverImage("https://img.example/cover.png");

    const doc = store.getState().currentDocument;

    expect(doc?.coverImage).toBe("https://img.example/cover.png");
    expect(doc?.blocks.root.properties.coverImage).toBe(
      "https://img.example/cover.png",
    );
    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: pageId,
        coverImage: "https://img.example/cover.png",
      }),
    );
    expect(store.getState().isSaving).toBe(false);
  });

  it("removeCoverImage clears the cover and persists the change", async () => {
    const store = getDocumentStore(pageId);
    const withCover = createNewBlankDocument(pageId);

    withCover.coverImage = "https://img.example/cover.png";
    withCover.blocks.root.properties.coverImage =
      "https://img.example/cover.png";
    store.setState({ currentDocument: withCover });

    await store.getState().removeCoverImage();

    const doc = store.getState().currentDocument!;

    expect(doc.coverImage).toBeUndefined();
    expect(doc.blocks.root.properties.coverImage).toBeUndefined();
    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId, coverImage: undefined }),
    );
  });

  it("updateIcon updates the document, root block, and sidebar tree", async () => {
    const store = getDocumentStore(pageId);

    await store.getState().updateIcon("🚀");

    const doc = store.getState().currentDocument;

    expect(doc?.icon).toBe("🚀");
    expect(doc?.blocks.root.properties.icon).toBe("🚀");
    expect(useSidebarStore.getState().pages[pageId]?.icon).toBe("🚀");
    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId, icon: "🚀" }),
    );
  });

  it("removeIcon clears the icon and resets the sidebar icon", async () => {
    const store = getDocumentStore(pageId);
    const withIcon = createNewBlankDocument(pageId);

    withIcon.icon = "🚀";
    withIcon.blocks.root.properties.icon = "🚀";
    store.setState({ currentDocument: withIcon });
    useSidebarStore.setState({
      pages: {
        [pageId]: {
          id: pageId,
          title: "Untitled",
          icon: "🚀",
          parentId: null,
          childrenIds: [],
        },
      },
    });

    await store.getState().removeIcon();

    const doc = store.getState().currentDocument!;

    expect(doc.icon).toBeUndefined();
    expect(doc.blocks.root.properties.icon).toBeUndefined();
    expect(useSidebarStore.getState().pages[pageId]?.icon).toBe("📄");
    expect(mockedSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: pageId, icon: undefined }),
    );
  });

  it("meta updates are no-ops without a loaded document", async () => {
    const store = getDocumentStore(pageId);

    store.setState({ currentDocument: null });

    await store.getState().updateTitle("X");
    await store.getState().updateCoverImage("u");
    await store.getState().removeCoverImage();
    await store.getState().updateIcon("i");
    await store.getState().removeIcon();

    expect(mockedSaveDocument).not.toHaveBeenCalled();
  });
});
