import { fireEvent, render, screen } from "@testing-library/react";
import {
  getDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditorPermissionsProvider } from "@/context/editor-permissions-context";
import { resetBlockDndState } from "@/hooks/editor/use-block-dnd";
import { EditorPageIdProvider } from "@/providers/document-provider";

import { BlockRow } from "../block-row";

describe("BlockRow Drag and Drop (Integration Tests)", () => {
  const pageId = "page-dnd-test";
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
    vi.restoreAllMocks();
    removeDocumentStore(pageId);
  });

  it("renders draggable grip handle when not read-only", () => {
    const { container } = render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockRow blockId="b-1" />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dragHandle = container.querySelector(
      "[data-testid='block-drag-handle']",
    );
    expect(dragHandle).not.toBeNull();
    expect(dragHandle?.getAttribute("draggable")).toBe("true");
  });

  it("does not render drag grip when read-only", () => {
    const { container } = render(
      <EditorPermissionsProvider value={viewerPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockRow blockId="b-1" />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    expect(
      container.querySelector("[data-testid='block-drag-handle']"),
    ).toBeNull();
  });

  it("renders drop indicator before on drag over top half and moves block", () => {
    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockRow blockId="b-1" />
          <BlockRow blockId="b-2" />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dragHandle1 = screen
      .getByTestId("block-row-b-1")
      .querySelector("[data-testid='block-drag-handle']")!;
    const row2 = screen.getByTestId("block-row-b-2");

    vi.spyOn(row2, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 200,
      height: 100,
      left: 0,
      right: 500,
      width: 500,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    // 1. Drag start on row 1
    fireEvent.dragStart(dragHandle1, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: "none",
      },
    });

    // 2. Drag over row 2 top half (clientY = 120, top = 100, height = 100 => ratio = 0.2 < 0.5)
    const dragOverTopEvent = new MouseEvent("dragover", {
      clientY: 120,
      bubbles: true,
      cancelable: true,
    });
    (dragOverTopEvent as any).dataTransfer = { dropEffect: "none" };
    fireEvent(row2, dragOverTopEvent);

    expect(screen.getByTestId("block-drop-indicator-before")).toBeDefined();

    // 3. Drop on row 2
    fireEvent.drop(row2, {
      clientY: 120,
      dataTransfer: {
        getData: (type: string) =>
          type === "application/x-yaad-block" ? "b-1" : "",
      },
    });

    expect(moveBlockMock).toHaveBeenCalledWith("b-1", "b-2", "before");
  });

  it("renders drop indicator after on drag over bottom half and moves block", () => {
    render(
      <EditorPermissionsProvider value={editorPermissions}>
        <EditorPageIdProvider pageId={pageId}>
          <BlockRow blockId="b-1" />
          <BlockRow blockId="b-2" />
        </EditorPageIdProvider>
      </EditorPermissionsProvider>,
    );

    const dragHandle1 = screen
      .getByTestId("block-row-b-1")
      .querySelector("[data-testid='block-drag-handle']")!;
    const row2 = screen.getByTestId("block-row-b-2");

    vi.spyOn(row2, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 200,
      height: 100,
      left: 0,
      right: 500,
      width: 500,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    fireEvent.dragStart(dragHandle1, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: "none",
      },
    });

    // clientY = 180, top = 100, height = 100 => ratio = 0.8 >= 0.5 => 'after'
    const dragOverBottomEvent = new MouseEvent("dragover", {
      clientY: 180,
      bubbles: true,
      cancelable: true,
    });
    (dragOverBottomEvent as any).dataTransfer = { dropEffect: "none" };
    fireEvent(row2, dragOverBottomEvent);

    expect(screen.getByTestId("block-drop-indicator-after")).toBeDefined();

    fireEvent.drop(row2, {
      clientY: 180,
      dataTransfer: {
        getData: (type: string) =>
          type === "application/x-yaad-block" ? "b-1" : "",
      },
    });

    expect(moveBlockMock).toHaveBeenCalledWith("b-1", "b-2", "after");
  });
});
