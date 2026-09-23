import type { DocumentBlock } from "@yaad/core/types/document";

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CodeBlock } from "../code-block";

const mockCodeToHtml = vi.hoisted(() => vi.fn());

vi.mock("shiki", () => ({
  bundledLanguages: {
    typescript: { id: "typescript" },
    javascript: { id: "javascript" },
    html: { id: "html" },
    css: { id: "css" },
    json: { id: "json" },
    rust: { id: "rust" },
  },
  codeToHtml: mockCodeToHtml,
}));

vi.mock("@/context/use-editor-context", () => ({
  useEditorPageIdContext: () => "test-page-id",
}));

vi.mock("@/hooks/editor/use-document-store-ui", () => ({
  useDocumentStore: (selector: any) =>
    selector({
      updateBlockProperties: vi.fn(),
      deleteBlock: vi.fn(),
    }),
}));

describe("CodeBlock", () => {
  const mockBlock: DocumentBlock = {
    id: "code-1",
    type: "code",
    parentId: "root",
    childrenIds: [],
    properties: {
      title: [{ text: "const answer = 42;" }],
      language: "typescript",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    mockCodeToHtml.mockReset();
  });

  it("renders highlighted HTML using Shiki", async () => {
    mockCodeToHtml.mockResolvedValue(
      '<span class="shiki"><span class="token keyword">const</span> answer = 42;</span>',
    );

    const { container } = render(<CodeBlock block={mockBlock} />);

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith("const answer = 42;", {
        lang: "typescript",
        theme: "github-dark",
      });
    });

    expect(container.querySelector(".shiki")).toBeTruthy();
  });
});
