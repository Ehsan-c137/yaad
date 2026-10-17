import { fireEvent, render, screen } from "@testing-library/react";
import { documentService } from "@yaad/core/services/document-service";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorPermissionsProvider } from "@/context/editor-permission-provider";
import {
  resetBlockDndState,
  setBlockDndState,
} from "@/hooks/editor/use-block-dnd";
import {
  resetDndState as resetSidebarDndState,
  setDndState as setSidebarDndState,
} from "@/hooks/sidebar/use-sidebar-dnd";
import { EditorPageIdProvider } from "@/providers/document-provider";

import { BlockCanvas } from "../block-canvas";

describe("BlockCanvas Drag and Drop Bottom Zone", () => {
  const pageId = "canvas-dnd-test";
  const moveBlockMock = vi.fn();

  const editorPermissions = {
    role: "member" as const,
    isReadOnly: false,
    canEdit: true,
    canManage: false,
    isLoading: false,
  };

  const viewerPermissions = {
    role: "viewer" as const,
    isReadOnly: true,
    canEdit: false,
    canManage: false,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetBlockDndState();

    const store = getDocumentStore(pageId);
    store.setState({
      moveBlock: moveBlockMock,
      currentDocument: {
        version: 1,
        id: pageId,
        title: "Test Page",
        rootBlockId: "root",
        blocks: {
          root: {
            id: "root",
            type: "page",
            parentId: null,
            childrenIds: ["b-1", "b-2"],
            properties: {},
            createdAt: 1000,
            updatedAt: 1000,
          },
          "b-1": {
            id: "b-1",
            type: "paragraph",
            parentId: "root",
            childrenIds: [],
            properties: { title: [{ text: "Block 1" }] },
            createdAt: 1000,
            updatedAt: 1000,
          },
          "b-2": {
            id: "b-2",
            type: "paragraph",
            parentId: "root",
            childrenIds: [],
            properties: { title: [{ text: "Block 2" }] },
            createdAt: 1000,
            updatedAt: 1000,
          },
        },
        createdAt: 1000,
        updatedAt: 1000,
      },
      _hasHydrated: true,
    });
  });

  afterEach(() => {
    removeDocumentStore(pageId);
    resetBlockDndState();
  });

  it("does not render bottom drop zone when no block is dragged", () => {
    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    expect(screen.queryByTestId("block-canvas-bottom-drop-zone")).toBeNull();
  });

  it("renders bottom drop zone when a block is being dragged", () => {
    setBlockDndState({ draggedBlockId: "b-1" });

    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    expect(screen.getByTestId("block-canvas-bottom-drop-zone")).toBeDefined();
  });

  it("highlights bottom drop zone on drag over and resets on drag leave", () => {
    setBlockDndState({ draggedBlockId: "b-1" });

    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dropZone = screen.getByTestId("block-canvas-bottom-drop-zone");

    fireEvent.dragOver(dropZone, {
      dataTransfer: { dropEffect: "none" },
    });

    expect(screen.getByText("Drop at bottom")).toBeDefined();

    fireEvent.dragLeave(dropZone);

    expect(screen.queryByText("Drop at bottom")).toBeNull();
  });

  it("drops block at the bottom of the canvas and calls moveBlock", () => {
    setBlockDndState({ draggedBlockId: "b-1" });

    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dropZone = screen.getByTestId("block-canvas-bottom-drop-zone");

    fireEvent.dragOver(dropZone, {
      dataTransfer: { dropEffect: "none" },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: (type: string) =>
          type === "application/x-yaad-block" ? "b-1" : "",
      },
    });

    // Root block children are ["b-1", "b-2"], so lastBlockId is "b-2"
    expect(moveBlockMock).toHaveBeenCalledWith("b-1", "b-2", "after");
  });

  it("does not render bottom drop zone when read-only", () => {
    setBlockDndState({ draggedBlockId: "b-1" });

    render(
      <EditorPermissionsProvider value={viewerPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    expect(screen.queryByTestId("block-canvas-bottom-drop-zone")).toBeNull();
  });

  it("renders bottom drop zone when dragging a sidebar page and attaches it on drop", () => {
    const attachSpy = vi
      .spyOn(documentService, "attachSubPageBlock")
      .mockResolvedValue("new-blk");
    const movePageSpy = vi
      .spyOn(useSidebarStore.getState(), "movePageInTree")
      .mockResolvedValue(undefined);

    setSidebarDndState({ draggedPageId: "sidebar-page-x" });

    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockCanvas />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dropZone = screen.getByTestId("block-canvas-bottom-drop-zone");

    fireEvent.dragOver(dropZone, {
      dataTransfer: { dropEffect: "none" },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: (type: string) =>
          type === "application/x-yaad-page" ? "sidebar-page-x" : "",
      },
    });

    expect(attachSpy).toHaveBeenCalledWith(pageId, "sidebar-page-x", {
      position: "after",
      targetBlockId: "b-2",
    });
    expect(movePageSpy).toHaveBeenCalledWith(
      "sidebar-page-x",
      pageId,
      "inside",
    );

    resetSidebarDndState();
  });
});
