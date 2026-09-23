import { render, screen } from "@testing-library/react";
import { createNewBlankDocument } from "@yaad/core/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorPageIdProvider } from "@/providers/document-provider";

import { PageHeader } from "../page-header";

vi.mock("react-router", () => ({
  useParams: () => ({ pageId: "page-1" }),
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("PageHeader", () => {
  beforeEach(() => {
    const store = getDocumentStore("page-1");
    const doc = createNewBlankDocument("page-1");
    doc.icon = "📄";
    store.setState({
      currentDocument: doc,
      _hasHydrated: true,
    });
  });

  afterEach(() => {
    removeDocumentStore("page-1");
  });

  it("renders", () => {
    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );
    const addCoverButton = screen.getByRole("button", { name: /add cover/i });

    expect(addCoverButton).toBeDefined();

    const pageIcon = container.querySelector("#page_icon");

    expect(pageIcon).not.toBeNull();

    const bookmarkButton = screen.getByLabelText("Add to bookmarks");

    expect(bookmarkButton).toBeDefined();
  });
});
