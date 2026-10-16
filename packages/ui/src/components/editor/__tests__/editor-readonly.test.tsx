import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { DocumentBlock } from "@yaad/core/types/document";
import { EditorPermissionsProvider } from "@/context/editor-permissions-context";
import { EditorPageIdProvider } from "@/providers/document-provider";
import { EditableContent } from "../block/editable-content";
import { BlockRow } from "../block/block-row";
import { BlockCanvas } from "../block-canvas";
import { getDocumentStore, removeDocumentStore } from "@yaad/core/store/document/use-document-store";

describe("Editor Read-Only Mode (Integration Tests)", () => {
  const viewerPermissions = {
    role: "viewer" as const,
    isReadOnly: true,
    canEdit: false,
    canManage: false,
    isLoading: false,
  };

  const editorPermissions = {
    role: "member" as const,
    isReadOnly: false,
    canEdit: true,
    canManage: false,
    isLoading: false,
  };

  describe("EditableContent", () => {
    it("disables editing and ignores input/keyboard events when readOnly", () => {
      const onChange = vi.fn();
      const onEnter = vi.fn();

      render(
        <EditableContent
          html="Read only text content"
          readOnly={true}
          onChange={onChange}
          onEnter={onEnter}
        />,
      );

      const textbox = screen.getByRole("textbox");
      expect(textbox.getAttribute("contenteditable")).toBe("false");
      expect(textbox.getAttribute("aria-readonly")).toBe("true");

      fireEvent.input(textbox, { target: { innerText: "Modified text" } });
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(textbox, { key: "Enter" });
      expect(onEnter).not.toHaveBeenCalled();
    });

    it("enables editing when readOnly is false", () => {
      const onChange = vi.fn();

      render(
        <EditableContent
          html="Editable text"
          readOnly={false}
          onChange={onChange}
        />,
      );

      const textbox = screen.getByRole("textbox");
      expect(textbox.getAttribute("contenteditable")).toBe("true");
      expect(textbox.getAttribute("aria-readonly")).toBe("false");
    });
  });

  describe("BlockRow", () => {
    const mockBlock: DocumentBlock = {
      id: "b-1",
      type: "paragraph",
      parentId: "root",
      childrenIds: [],
      properties: {
        title: [{ text: "Hello paragraph" }],
      },
      createdAt: 1000,
      updatedAt: 1000,
    };

    beforeEach(() => {
      const store = getDocumentStore("page-1");
      store.setState({
        currentDocument: {
          version: 1,
          id: "page-1",
          title: "Page 1",
          icon: "📄",
          coverImage: undefined,
          rootBlockId: "root",
          blocks: {
            root: {
              id: "root",
              type: "page",
              parentId: null,
              childrenIds: ["b-1"],
              properties: {},
              createdAt: 1000,
              updatedAt: 1000,
            },
            "b-1": mockBlock,
          },
          createdAt: 1000,
          updatedAt: 1000,
        },
        _hasHydrated: true,
      });
    });

    afterEach(() => {
      removeDocumentStore("page-1");
    });

    it("hides gutter add button and drag grip in read-only mode", () => {
      const { container } = render(
        <EditorPermissionsProvider value={viewerPermissions}>
          <EditorPageIdProvider pageId="page-1">
            <BlockRow blockId="b-1" />
          </EditorPageIdProvider>
        </EditorPermissionsProvider>,
      );

      expect(container.querySelector(".lucide-plus")).toBeNull();
      expect(container.querySelector(".lucide-grip-vertical")).toBeNull();
    });

    it("renders gutter add button and drag grip in editor mode", () => {
      const { container } = render(
        <EditorPermissionsProvider value={editorPermissions}>
          <EditorPageIdProvider pageId="page-1">
            <BlockRow blockId="b-1" />
          </EditorPageIdProvider>
        </EditorPermissionsProvider>,
      );

      expect(container.querySelector(".lucide-plus")).not.toBeNull();
      expect(container.querySelector(".lucide-grip-vertical")).not.toBeNull();
    });
  });

  describe("BlockCanvas", () => {
    beforeEach(() => {
      const store = getDocumentStore("page-1");
      store.setState({
        currentDocument: {
          version: 1,
          id: "page-1",
          title: "Page 1",
          icon: "📄",
          coverImage: undefined,
          rootBlockId: "root",
          blocks: {
            root: {
              id: "root",
              type: "page",
              parentId: null,
              childrenIds: [],
              properties: {},
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
      removeDocumentStore("page-1");
    });

    it("displays empty page read-only state and avoids auto-adding blocks", () => {
      render(
        <EditorPermissionsProvider value={viewerPermissions}>
          <EditorPageIdProvider pageId="page-1">
            <BlockCanvas />
          </EditorPageIdProvider>
        </EditorPermissionsProvider>,
      );

      expect(screen.getByText(/this page is empty/i)).toBeDefined();
      expect(screen.queryByText(/click "add initial block"/i)).toBeNull();
    });
  });
});
