import { fireEvent, render, screen } from "@testing-library/react";
import { createNewBlankDocument } from "@yaad/core/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorPageIdProvider } from "@/providers/document-provider";

import { PageHeader } from "../page-header";

vi.mock("react-router", () => ({
  useParams: () => ({ pageId: "page-1" }),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
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
    useSidebarStore.setState({ pages: {} });
  });

  it("renders", () => {
    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );
    const addCoverButton = screen.getByRole("button", {
      name: /add cover|addcover/i,
    });

    expect(addCoverButton).toBeDefined();

    const pageIcon = container.querySelector("#page_icon");

    expect(pageIcon).not.toBeNull();

    const bookmarkButton = screen.getByLabelText(
      /add to bookmarks|addtobookmarks/i,
    );

    expect(bookmarkButton).toBeDefined();
  });

  it("renders saved sidebar title and icon immediately while document is still hydrating", () => {
    useSidebarStore.setState({
      pages: {
        "page-1": {
          childrenIds: [],
          icon: "🚀",
          id: "page-1",
          parentId: null,
          title: "Saved Meeting Title",
        },
      },
    });

    const store = getDocumentStore("page-1");
    store.setState({
      _hasHydrated: false,
      currentDocument: null,
    });

    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );

    const pageIcon = container.querySelector("#page_icon");

    expect(pageIcon?.textContent).toBe("🚀");

    expect(screen.getByText("Saved Meeting Title")).toBeDefined();
  });

  it("renders cover first, and reveals cover action buttons after the image loads", () => {
    const store = getDocumentStore("page-1");
    const doc = createNewBlankDocument("page-1");
    doc.coverImage = "https://images.unsplash.com/photo-test-cover";
    store.setState({
      currentDocument: doc,
      _hasHydrated: true,
    });

    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );

    // Cover container is immediately rendered
    const coverContainer = container.querySelector(".animate-page-cover");

    expect(coverContainer).not.toBeNull();

    // Buttons inside cover are not shown before the cover image finishes loading
    expect(screen.queryByText(/change cover|changecover/i)).toBeNull();

    // Trigger image onLoad event
    const img = coverContainer?.querySelector("img");

    expect(img).not.toBeNull();

    fireEvent.load(img!);

    // After cover loads, the buttons inside it appear
    expect(screen.getByText(/change cover|changecover/i)).toBeDefined();
  });

  it("renders title with animate-page-title intro animation class", () => {
    const { container } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );

    const titleElement = container.querySelector(".animate-page-title");

    expect(titleElement).not.toBeNull();
  });

  it("renders exiting title with animate-page-title-outro when pageId changes", () => {
    const store1 = getDocumentStore("page-1");
    const doc1 = createNewBlankDocument("page-1");
    doc1.blocks.root.properties.title = [{ text: "First Page Title" }];
    store1.setState({ currentDocument: doc1, _hasHydrated: true });

    const store2 = getDocumentStore("page-2");
    const doc2 = createNewBlankDocument("page-2");
    doc2.blocks.root.properties.title = [{ text: "Second Page Title" }];
    store2.setState({ currentDocument: doc2, _hasHydrated: true });

    useSidebarStore.setState({
      pages: {
        "page-1": {
          childrenIds: [],
          icon: "📄",
          id: "page-1",
          parentId: null,
          title: "First Page Title",
        },
        "page-2": {
          childrenIds: [],
          icon: "📄",
          id: "page-2",
          parentId: null,
          title: "Second Page Title",
        },
      },
    });

    const { container, rerender } = render(
      <EditorPageIdProvider pageId="page-1">
        <PageHeader />
      </EditorPageIdProvider>,
    );

    expect(screen.getByText("First Page Title")).toBeDefined();

    rerender(
      <EditorPageIdProvider pageId="page-2">
        <PageHeader />
      </EditorPageIdProvider>,
    );

    const outroElement = container.querySelector(".animate-page-title-outro");

    expect(outroElement).not.toBeNull();
    expect(outroElement?.textContent).toBe("First Page Title");

    fireEvent.animationEnd(outroElement!);

    expect(container.querySelector(".animate-page-title-outro")).toBeNull();

    removeDocumentStore("page-2");
  });
});
