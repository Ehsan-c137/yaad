import { render, screen } from "@testing-library/react";
import { createNewBlankDocument } from "@yaad/core/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorShell } from "../editor-shell";

vi.mock("react-router", () => ({
  useParams: () => ({ pageId: "page-test-1", workspaceId: "ws-1" }),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("EditorShell", () => {
  beforeEach(() => {
    useSidebarStore.setState({
      pages: {
        "page-test-1": {
          childrenIds: [],
          icon: "⚡",
          id: "page-test-1",
          parentId: null,
          title: "Instant Loaded Title",
        },
      },
    });

    const store = getDocumentStore("page-test-1");
    store.setState({
      _hasHydrated: false,
      currentDocument: null,
    });
  });

  afterEach(() => {
    removeDocumentStore("page-test-1");
    useSidebarStore.setState({ pages: {} });
  });

  it("renders page header and block skeleton instantly while document is hydrating", () => {
    const { container } = render(<EditorShell pageId="page-test-1" />);

    // Page header title is immediately visible from sidebar store
    expect(screen.getByText("Instant Loaded Title")).toBeDefined();

    // Page icon is immediately visible from sidebar store
    const pageIcon = container.querySelector("#page_icon");

    expect(pageIcon?.textContent).toBe("⚡");

    // Skeleton is placed specifically in block canvas area
    const skeleton = container.querySelector(
      '[data-slot="block-canvas-skeleton"]',
    );

    expect(skeleton).not.toBeNull();
  });

  it("renders block canvas once hydrated without unmounting page header", () => {
    const store = getDocumentStore("page-test-1");
    const doc = createNewBlankDocument("page-test-1");
    doc.blocks.root.properties.title = [{ text: "Instant Loaded Title" }];
    doc.icon = "⚡";

    store.setState({
      _hasHydrated: true,
      currentDocument: doc,
    });

    const { container } = render(<EditorShell pageId="page-test-1" />);

    expect(screen.getByText("Instant Loaded Title")).toBeDefined();

    const skeleton = container.querySelector(
      '[data-slot="block-canvas-skeleton"]',
    );

    expect(skeleton).toBeNull();
  });
});
