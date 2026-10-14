import { render, screen } from "@testing-library/react";
import { createNewBlankDocument } from "@yaad/core/store/document/helpers";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorPermissionsProvider } from "@/context/editor-permissions-context";
import { EditorPageIdProvider } from "@/providers/document-provider";
import { PageHeader } from "../page-header";

vi.mock("react-router", () => ({
  useParams: () => ({ workspaceId: "ws-collab", pageId: "page-1" }),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PageHeader in Read-Only Mode", () => {
  beforeEach(() => {
    const store = getDocumentStore("page-1");
    const doc = createNewBlankDocument("page-1");
    doc.icon = "📖";
    store.setState({
      currentDocument: doc,
      _hasHydrated: true,
    });
  });

  afterEach(() => {
    removeDocumentStore("page-1");
    useSidebarStore.setState({ pages: {} });
  });

  it("renders View Only badge and hides cover add button when user has viewer role", () => {
    const viewerPermissions = {
      role: "viewer" as const,
      isReadOnly: true,
      canEdit: false,
      canManage: false,
      isLoading: false,
    };

    render(
      <EditorPermissionsProvider value={viewerPermissions}>
        <EditorPageIdProvider pageId="page-1">
          <PageHeader />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    // 1. Should display View only badge
    expect(screen.getByText(/view only/i)).toBeDefined();

    // 2. Cover "Add cover" button should not be rendered
    const addCoverBtn = screen.queryByRole("button", { name: /add cover/i });
    expect(addCoverBtn).toBeNull();

    // 3. Document title input should have aria-readonly="true" and contentEditable="false"
    const titleInput = screen.getByRole("textbox");
    expect(titleInput.getAttribute("contenteditable")).toBe("false");
    expect(titleInput.getAttribute("aria-readonly")).toBe("true");
  });

  it("renders Add cover and editable title when user is owner/editor", () => {
    const editorPermissions = {
      role: "member" as const,
      isReadOnly: false,
      canEdit: true,
      canManage: false,
      isLoading: false,
    };

    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId="page-1">
          <PageHeader />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    // 1. Should NOT display View only badge
    expect(screen.queryByText(/view only/i)).toBeNull();

    // 2. Cover "Add cover" button should be rendered
    const addCoverBtn = screen.getByRole("button", { name: /add cover/i });
    expect(addCoverBtn).toBeDefined();

    // 3. Document title should be editable
    const titleInput = screen.getByRole("textbox");
    expect(titleInput.getAttribute("contenteditable")).toBe("true");
    expect(titleInput.getAttribute("aria-readonly")).toBe("false");
  });
});
