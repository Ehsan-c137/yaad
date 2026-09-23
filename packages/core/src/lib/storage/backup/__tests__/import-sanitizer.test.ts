import { describe, expect, it } from "vitest";

import { sanitizeImportData } from "../import-sanitizer";

type RawPayload = Record<string, unknown>;

function makeBlock(overrides: RawPayload = {}): RawPayload {
  return {
    id: "root",
    type: "page",
    parentId: null,
    childrenIds: [],
    properties: { title: [{ text: "Page One" }] },
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function makeDocument(overrides: RawPayload = {}): RawPayload {
  return {
    version: 1,
    id: "page_1",
    title: "Page One",
    rootBlockId: "root",
    icon: "📄",
    createdAt: 1,
    updatedAt: 1,
    blocks: { root: makeBlock() },
    ...overrides,
  };
}

function makeWorkspace(overrides: RawPayload = {}): RawPayload {
  return {
    id: "ws_1",
    name: "Personal",
    icon: "🏠",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function makeData(overrides: RawPayload = {}): RawPayload {
  return {
    blobs: [],
    documents: { page_1: makeDocument() },
    inbox: [],
    tabs: [],
    trees: {
      ws_1: [
        {
          id: "page_1",
          workspaceId: "ws_1",
          title: "Page One",
          parentId: null,
          childrenIds: [],
          updatedAt: 1,
        },
      ],
    },
    workspaces: [makeWorkspace()],
    ...overrides,
  };
}

function makePayload(overrides: RawPayload = {}): RawPayload {
  return {
    app: "yaad",
    data: makeData(),
    exportedAt: 123,
    version: 1,
    ...overrides,
  };
}

describe("sanitizeImportData (Unit Test)", () => {
  it("rejects non-object payloads", () => {
    for (const raw of [null, "string", 42, true]) {
      const result = sanitizeImportData(raw);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Invalid file format. Backup file must be a valid JSON object.",
      );
    }
  });

  it("rejects payloads without yaad application metadata", () => {
    const missingApp = sanitizeImportData({ data: makeData() });
    const wrongApp = sanitizeImportData({ app: "other", data: makeData() });

    expect(missingApp.valid).toBe(false);
    expect(wrongApp.valid).toBe(false);
    expect(missingApp.error).toBe(
      "Unrecognized backup file. Missing 'yaad' application metadata.",
    );
  });

  it("rejects payloads without any valid workspace", () => {
    const result = sanitizeImportData(
      makePayload({ data: makeData({ workspaces: [] }) }),
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "No valid workspace entries found in backup file.",
    );
  });

  it("accepts a valid payload and reports import stats", () => {
    const result = sanitizeImportData(makePayload());

    expect(result.valid).toBe(true);
    expect(result.stats).toEqual({
      blobCount: 0,
      documentCount: 1,
      sanitizedStringCount: 0,
      workspaceCount: 1,
    });
    expect(result.payload?.data.workspaces[0]).toMatchObject({
      id: "ws_1",
      name: "Personal",
      icon: "🏠",
    });
    expect(result.payload?.data.documents.page_1?.title).toBe("Page One");
    expect(result.payload?.data.trees.ws_1).toHaveLength(1);
    expect(result.payload?.exportedAt).toBe(123);
    expect(result.payload?.version).toBe(1);
  });

  it("strips script tags from strings", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          workspaces: [
            makeWorkspace({ name: "<script>alert(1)</script>My Notes" }),
          ],
        }),
      }),
    );

    expect(result.valid).toBe(true);
    expect(result.payload?.data.workspaces[0]?.name).toBe("My Notes");
    expect(result.stats.sanitizedStringCount).toBeGreaterThan(0);
  });

  it("removes inline event handlers from strings", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          workspaces: [makeWorkspace({ name: "Hello onload=alert(1) world" })],
        }),
      }),
    );

    expect(result.valid).toBe(true);

    const name = result.payload?.data.workspaces[0]?.name ?? "";

    expect(name).not.toContain("onload");
    expect(name).toContain("Hello");
  });

  it("strips dangerous keys from block properties", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          documents: {
            page_1: makeDocument({
              blocks: {
                root: makeBlock(),
                polluted: makeBlock({
                  id: "polluted",
                  type: "paragraph",
                  parentId: "root",
                  properties: JSON.parse(
                    '{"__proto__": {"bad": true}, "constructor": "x", "prototype": "y", "title": [{"text": "ok"}]}',
                  ),
                }),
              },
            }),
          },
        }),
      }),
    );

    const properties = result.payload?.data.documents.page_1?.blocks.polluted
      ?.properties as Record<string, unknown>;

    expect(Object.keys(properties)).not.toContain("__proto__");
    expect(Object.keys(properties)).not.toContain("constructor");
    expect(Object.keys(properties)).not.toContain("prototype");
    expect(properties.title).toEqual([{ text: "ok" }]);
  });

  it("drops javascript: urls and keeps safe ones", () => {
    const dangerous = sanitizeImportData(
      makePayload({
        data: makeData({
          documents: {
            page_1: makeDocument({ coverImage: "javascript:alert(1)" }),
          },
        }),
      }),
    );
    const htmlData = sanitizeImportData(
      makePayload({
        data: makeData({
          documents: {
            page_1: makeDocument({ coverImage: "data:text/html:x" }),
          },
        }),
      }),
    );
    const safe = sanitizeImportData(
      makePayload({
        data: makeData({
          documents: {
            page_1: makeDocument({
              coverImage: "https://img.example/cover.png",
            }),
          },
        }),
      }),
    );

    expect(
      dangerous.payload?.data.documents.page_1?.coverImage,
    ).toBeUndefined();
    expect(htmlData.payload?.data.documents.page_1?.coverImage).toBeUndefined();
    expect(safe.payload?.data.documents.page_1?.coverImage).toBe(
      "https://img.example/cover.png",
    );
  });

  // Documents a current sanitizer limitation: "data:text/html;base64,..."
  // carries parameters before the colon check and passes through unstripped.
  it("passes through data:text/html urls that carry parameters (known gap)", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          documents: {
            page_1: makeDocument({
              coverImage: "data:text/html;base64,PHNjcmlwdD4=",
            }),
          },
        }),
      }),
    );

    expect(result.payload?.data.documents.page_1?.coverImage).toBe(
      "data:text/html;base64,PHNjcmlwdD4=",
    );
  });

  it("applies defaults for malformed optional fields", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          workspaces: [{ id: "ws_1" }],
          documents: { page_1: { id: "page_1" } },
        }),
      }),
    );

    const workspace = result.payload?.data.workspaces[0] as unknown as Record<
      string,
      unknown
    >;

    expect(workspace.icon).toBe("💼");
    expect(workspace.name).toBe("Untitled Workspace");
    expect(typeof workspace.createdAt).toBe("number");
    expect(typeof workspace.updatedAt).toBe("number");

    const doc = result.payload?.data.documents.page_1;

    expect(doc).toMatchObject({
      id: "page_1",
      title: "Untitled",
      version: 1,
      rootBlockId: "root",
    });
    expect(doc?.blocks).toEqual({});
  });

  it("filters invalid tree, blob, tab and inbox entries", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({
          blobs: [
            {
              id: "bad",
              dataUrl: "http://not-a-data-url",
              mimeType: "text/plain",
            },
            {
              id: "good",
              dataUrl: "data:text/plain;base64,AAAA",
              mimeType: "text/plain",
            },
          ],
          inbox: [
            {
              id: "n1",
              title: "Hi",
              description: "d",
              type: "mention",
              read: false,
            },
            { title: "no id" },
            "junk",
          ],
          tabs: [
            { id: "t1", pageId: "p1", workspaceId: "ws_1", title: "Tab" },
            {},
            "junk",
          ],
          trees: {
            ws_1: [
              null,
              "junk",
              {
                id: "p1",
                workspaceId: "ws_1",
                title: "P",
                parentId: null,
                childrenIds: [],
                updatedAt: 1,
              },
            ],
            ws_broken: "not-an-array",
          },
        }),
      }),
    );

    expect(result.payload?.data.blobs.map((blob) => blob.id)).toEqual(["good"]);
    expect(result.payload?.data.inbox).toHaveLength(1);
    expect(result.payload?.data.tabs).toHaveLength(1);
    expect(result.payload?.data.tabs?.[0]).toMatchObject({
      id: "t1",
      isPinned: false,
    });
    expect(result.payload?.data.trees.ws_1).toHaveLength(1);
    expect(result.payload?.data.trees.ws_broken).toBeUndefined();
  });

  it("fills sanitized defaults for bare tree nodes", () => {
    const result = sanitizeImportData(
      makePayload({
        data: makeData({ trees: { ws_1: [{ id: "p1" }] } }),
      }),
    );

    const node = result.payload?.data.trees.ws_1?.[0] as unknown as Record<
      string,
      unknown
    >;

    expect(node.id).toBe("p1");
    expect(node.title).toBe("Untitled Page");
    expect(node.childrenIds).toEqual([]);
    expect(node.workspaceId).toBe("ws_1");
    expect(typeof node.updatedAt).toBe("number");
  });
});
