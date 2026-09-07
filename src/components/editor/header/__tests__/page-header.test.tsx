import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentJSON } from "@/types/document";

import { EditorPageIdProvider } from "@/store/document/document-provider";
import { createNewBlankDocument } from "@/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@/store/document/use-document-store";

import { PageHeader } from "../page-header";

vi.mock("next/navigation", () => ({
  useParams: () => ({ pageId: "page-1" }),
}));

describe("PageHeader", () => {
  beforeEach(() => {
    const document: DocumentJSON = createNewBlankDocument("page-1");

    getDocumentStore("page-1").setState({ currentDocument: document });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeDocumentStore("page-1");
  });

  it("renders", () => {
    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );
    const addCoverButton = screen.getByRole("button", { name: /add cover/i });

    expect(addCoverButton).toBeInTheDocument();

    const pageIcon = container.querySelector("#page_icon");

    expect(pageIcon).toBeInTheDocument();

    const bookmarkButton = screen.getByLabelText("Add to bookmarks");

    expect(bookmarkButton).toBeInTheDocument();
  });
});
