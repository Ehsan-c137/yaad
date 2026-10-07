import type { DocumentBlock } from "@yaad/core/types/document";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileBlockDrawer } from "../drawer";

const mockActions = {
  duplicate: vi.fn(),
  delete: vi.fn(),
  changeType: vi.fn(),
  applyColor: vi.fn(),
  addTag: vi.fn(),
  removeTag: vi.fn(),
  updateTags: vi.fn(),
};

const mockOpenPageInNewTab = vi.fn();
const mockOpenSidePeek = vi.fn();
const mockCopyLink = vi.fn();

vi.mock("@/hooks/editor/use-block-actions", () => ({
  useBlockActions: () => mockActions,
}));

vi.mock("@/hooks/editor/use-open-page-in-new-tab", () => ({
  useOpenPageInNewTab: () => mockOpenPageInNewTab,
}));

vi.mock("@/hooks/editor/use-side-peek", () => ({
  useSidePeek: () => ({ openSidePeek: mockOpenSidePeek }),
}));

vi.mock("@/hooks/editor/use-copy-block-link", () => ({
  useCopyBlockLink: () => mockCopyLink,
}));

vi.mock("react-router", () => ({
  useParams: () => ({ pageId: "page-123" }),
}));

const mockBlock: DocumentBlock = {
  id: "block-1",
  type: "paragraph",
  parentId: "root",
  childrenIds: [],
  properties: {
    bgColor: "default",
    lastEditedBy: "Ehsan",
  },
  tags: [],
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe("MobileBlockDrawer (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the default trigger button with block type name", () => {
    render(<MobileBlockDrawer block={mockBlock} />);

    expect(screen.getByText("Text")).toBeDefined();
  });

  it("renders a custom trigger when provided", () => {
    render(
      <MobileBlockDrawer
        block={mockBlock}
        trigger={<button type="button">Custom Trigger</button>}
      />,
    );

    expect(screen.getByText("Custom Trigger")).toBeDefined();
  });

  it("renders drawer content and triggers actions when opened", () => {
    const handleOpenChange = vi.fn();

    render(
      <MobileBlockDrawer
        block={mockBlock}
        open={true}
        onOpenChange={(nextOpen) => {
          handleOpenChange(nextOpen);
        }}
      />,
    );

    // Verify sections rendered
    expect(screen.getAllByText("Text").length).toBeGreaterThan(0);
    expect(screen.getByText("Duplicate")).toBeDefined();
    expect(screen.getByText("Delete block")).toBeDefined();
    expect(screen.getByText("Turn into")).toBeDefined();
    expect(screen.getByText("Background Color")).toBeDefined();
    expect(screen.getByText("Copy link to block")).toBeDefined();
    expect(screen.getByText("Open in new tab")).toBeDefined();
    expect(screen.getByText("Open in side peek")).toBeDefined();

    // Trigger duplicate
    fireEvent.click(screen.getByText("Duplicate"));

    expect(mockActions.duplicate).toHaveBeenCalledExactlyOnceWith();
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // Trigger delete
    fireEvent.click(screen.getByText("Delete block"));

    expect(mockActions.delete).toHaveBeenCalledExactlyOnceWith();

    // Trigger turn into heading 1
    fireEvent.click(screen.getByText("Heading 1"));

    expect(mockActions.changeType).toHaveBeenCalledWith("heading_1");

    // Trigger color change
    fireEvent.click(screen.getByText("Blue"));

    expect(mockActions.applyColor).toHaveBeenCalledWith({ bgColor: "blue" });

    // Trigger copy link
    fireEvent.click(screen.getByText("Copy link to block"));

    expect(mockCopyLink).toHaveBeenCalledExactlyOnceWith();

    // Trigger open in new tab
    fireEvent.click(screen.getByText("Open in new tab"));

    expect(mockOpenPageInNewTab).toHaveBeenCalledExactlyOnceWith({
      pageId: "block-1",
      title: "Untitled",
      icon: undefined,
    });

    // Trigger open in side peek
    fireEvent.click(screen.getByText("Open in side peek"));

    expect(mockOpenSidePeek).toHaveBeenCalledWith("block-1");
  });
});
