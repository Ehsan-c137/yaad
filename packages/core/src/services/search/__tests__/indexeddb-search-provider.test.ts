import type {
  DocumentBlock,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";
import type { WorkspacePageMeta } from "@yaad/core/types/workspace";

import { describe, expect, it, vi } from "vitest";

import type {
  SearchDocumentReader,
  SearchPageMeta,
  SearchTagIndexReader,
} from "../search-types";

import {
  createIndexedDbSearchProvider,
  extractBlockSnippet,
  getRecentPages,
  IndexedDbSearchProvider,
  searchPages,
  searchPagesByTitle,
  searchTags,
} from "../indexeddb-search-provider";

function createMockBlock(
  overrides: Partial<DocumentBlock> & {
    id: string;
    type: DocumentBlock["type"];
  },
): DocumentBlock {
  return {
    childrenIds: [],
    createdAt: 1,
    parentId: null,
    properties: {},
    updatedAt: 1,
    ...overrides,
  };
}

describe("extractBlockSnippet (pure function)", () => {
  it("extracts text snippet from rich text title segments", () => {
    const snippet = extractBlockSnippet(
      createMockBlock({
        id: "b1",
        type: "paragraph",
        properties: {
          title: [{ text: "Hello " }, { text: "World" }],
        },
      }),
    );

    expect(snippet).toBe("Hello World");
  });

  it("extracts text snippet from code block properties", () => {
    const snippet = extractBlockSnippet(
      createMockBlock({
        id: "b2",
        type: "code",
        properties: {
          code: "const x = 42;",
        },
      }),
    );

    expect(snippet).toBe("const x = 42;");
  });

  it("extracts text snippet from image caption properties", () => {
    const snippet = extractBlockSnippet(
      createMockBlock({
        id: "b3",
        type: "image",
        properties: {
          caption: "Architecture diagram",
        },
      }),
    );

    expect(snippet).toBe("Architecture diagram");
  });

  it("truncates text to specified maxLength", () => {
    const snippet = extractBlockSnippet(
      createMockBlock({
        id: "b4",
        type: "paragraph",
        properties: {
          title: [{ text: "abcdefghijklmnopqrstuvwxyz" }],
        },
      }),
      10,
    );

    expect(snippet).toBe("abcdefghij");
  });

  it("returns empty string when properties are missing or unrecognized", () => {
    const snippet = extractBlockSnippet(
      createMockBlock({
        id: "b5",
        type: "separator",
        properties: {},
      }),
    );

    expect(snippet).toBe("");
  });
});

describe("getRecentPages (pure synchronous function)", () => {
  it("sorts pages by updatedAt descending and respects limit", () => {
    const mockPages: Record<string, SearchPageMeta> = {
      p1: { id: "p1", title: "Page 1", updatedAt: 100 },
      p2: { id: "p2", title: "Page 2", updatedAt: 300 },
      p3: { id: "p3", title: "Page 3", updatedAt: 200 },
    };

    const recent = getRecentPages(mockPages, 2);

    expect(recent).toHaveLength(2);
    expect(recent[0]?.id).toBe("p2");
    expect(recent[0]?.title).toBe("Page 2");
    expect(recent[0]?.category).toBe("recent");
    expect(recent[1]?.id).toBe("p3");
    expect(recent[1]?.title).toBe("Page 3");
  });
});

describe("searchPages & searchPagesByTitle (pure functions)", () => {
  const mockPages: Record<string, SearchPageMeta> = {
    p1: { id: "p1", title: "Project Roadmap", icon: "🗺️" },
    p2: { id: "p2", title: "Meeting Notes", icon: "📝" },
    p3: { id: "p3", title: "Archived Notes", icon: "📦" },
  };

  it("searches pages by title matching query", () => {
    const results = searchPagesByTitle(mockPages, "notes", "ws_1");

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual(["p2", "p3"]);
    expect(results[0]?.category).toBe("page");
    expect(results[0]?.workspaceId).toBe("ws_1");
  });

  it("returns all pages when query is empty", () => {
    const results = searchPagesByTitle(mockPages, "", "ws_1");

    expect(results).toHaveLength(3);
  });

  it("searches blocks via tag index when tagId is provided", async () => {
    const mockTagIndexReader: SearchTagIndexReader = {
      getTagsIndex: vi.fn().mockResolvedValue([
        {
          tagId: "t1",
          pageId: "p1",
          blockId: "b10",
          blockType: "paragraph",
          snippet: "Discuss roadmap with team",
          updatedAt: 100,
        },
        {
          tagId: "t1",
          pageId: "p2",
          blockId: "b20",
          blockType: "todo",
          snippet: "Review notes",
          updatedAt: 200,
        },
      ]),
    };

    const results = await searchPages({
      pages: mockPages,
      query: "roadmap",
      tagId: "t1",
      tagIndexReader: mockTagIndexReader,
      workspaceId: "ws_1",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("p1_b10");
    expect(results[0]?.category).toBe("block");
    expect(results[0]?.title).toBe("Project Roadmap");
    expect(results[0]?.subtitle).toBe("paragraph: Discuss roadmap with team");
  });
});

describe("searchTags (pure function)", () => {
  const sampleTags: Tag[] = [
    { id: "t1", name: "urgent", color: "red" },
    { id: "t2", name: "personal", color: "blue" },
  ];

  const mockPages: Record<string, SearchPageMeta> = {
    p1: { id: "p1", title: "Sprint Planning" },
  };

  it("returns empty array when query is empty", async () => {
    const results = await searchTags({
      pages: mockPages,
      query: "",
      tags: sampleTags,
      workspaceId: "ws_1",
    });

    expect(results).toEqual([]);
  });

  it("finds matching tags and resolves records from tagIndexReader", async () => {
    const tagIndexReader: SearchTagIndexReader = {
      getTagsIndex: vi.fn().mockResolvedValue([
        {
          tagId: "t1",
          pageId: "p1",
          blockId: "b1",
          blockType: "paragraph",
          snippet: "Fix critical login bug",
          updatedAt: 12345,
        },
      ]),
    };

    const results = await searchTags({
      pages: mockPages,
      query: "urg",
      tagIndexReader,
      tags: sampleTags,
      workspaceId: "ws_1",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("t1");
    expect(results[0]?.title).toBe("#urgent");
    expect(results[0]?.subtitle).toBe("Fix critical login bug");
    expect(results[0]?.tag?.metadata?.locations).toHaveLength(1);
    expect(results[0]?.tag?.metadata?.pageTitle).toBe("Sprint Planning");
  });

  it("falls back to document scan when tag index is empty", async () => {
    const tagIndexReader: SearchTagIndexReader = {
      getTagsIndex: vi.fn().mockResolvedValue([]),
    };

    const mockDoc: DocumentJSON = {
      id: "p1",
      title: "Sprint Planning",
      version: 1,
      rootBlockId: "b1",
      blocks: {
        b1: createMockBlock({
          id: "b1",
          type: "paragraph",
          properties: {
            title: [{ text: "Fallback tagged block content" }],
          },
          tags: [{ id: "t1", name: "urgent", color: "red" }],
        }),
      },
      createdAt: 1,
      updatedAt: 2,
    };

    const documentReader: SearchDocumentReader = {
      getDocument: vi.fn().mockResolvedValue(mockDoc),
    };

    const results = await searchTags({
      documentReader,
      pages: mockPages,
      query: "urg",
      tagIndexReader,
      tags: sampleTags,
      workspaceId: "ws_1",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("t1");
    expect(results[0]?.subtitle).toBe("Fallback tagged block content");
    expect(documentReader.getDocument).toHaveBeenCalledWith("p1");
  });
});

describe("createIndexedDbSearchProvider & IndexedDbSearchProvider", () => {
  const mockPages: Record<string, WorkspacePageMeta> = {
    p1: {
      id: "p1",
      title: "Frontend Guide",
      workspaceId: "ws_1",
      updatedAt: 50,
      parentId: null,
      childrenIds: [],
    },
  };

  const mockTags: Tag[] = [{ id: "t1", name: "guide", color: "green" }];

  it("orchestrates search through functional factory", async () => {
    const provider = createIndexedDbSearchProvider({
      pageStateProvider: {
        getPages: () => mockPages,
      },
      tagStateProvider: {
        getTags: () => mockTags,
      },
      tagIndexReader: {
        getTagsIndex: vi.fn().mockResolvedValue([]),
      },
      documentReader: {
        getDocument: vi.fn().mockResolvedValue(null),
      },
    });

    const response = await provider.search({
      query: "guide",
      tagId: null,
      workspaceId: "ws_1",
    });

    expect(response.pages).toHaveLength(1);
    expect(response.pages[0]?.title).toBe("Frontend Guide");
    expect(response.tags).toHaveLength(1);
    expect(response.tags[0]?.title).toBe("#guide");

    const recent = await provider.getRecentPages(1);

    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe("p1");
  });

  it("works with class adapter for backward compatibility", async () => {
    const provider = new IndexedDbSearchProvider({
      pageStateProvider: {
        getPages: () => mockPages,
      },
      tagStateProvider: {
        getTags: () => mockTags,
      },
      tagIndexReader: {
        getTagsIndex: vi.fn().mockResolvedValue([]),
      },
      documentReader: {
        getDocument: vi.fn().mockResolvedValue(null),
      },
    });

    const recent = await provider.getRecentPages(1);

    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe("p1");
  });
});
