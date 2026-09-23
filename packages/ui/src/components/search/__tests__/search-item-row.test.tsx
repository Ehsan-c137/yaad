import type { SearchItem } from "@yaad/core/types/search";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchItemRow } from "../search-item-row";

vi.mock("@/components/ui/command", () => ({
  CommandItem: ({ children, onSelect, value }: any) => (
    <div data-testid="command-item" onClick={onSelect} data-value={value}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/editor/tags/tag-badge", () => ({
  TagBadge: ({ tag }: any) => <div data-testid="tag-badge">{tag.name}</div>,
}));

describe("SearchItemRow", () => {
  it("renders page item correctly", () => {
    const item: SearchItem = {
      id: "page-1",
      title: "My test page",
      category: "page",
      pageId: "page-1",
      workspaceId: "ws-1",
      icon: "📄",
    };

    render(<SearchItemRow item={item} onSelect={vi.fn()} />);

    expect(screen.getAllByText("My test page").length).toBeGreaterThan(0);
    expect(screen.getAllByText("📄").length).toBeGreaterThan(0);
  });

  it("renders block item with correct snippet and block type", () => {
    const item: SearchItem = {
      id: "block-1",
      title: "Block content here",
      subtitle: "paragraph: Some content snippet",
      category: "block",
      pageId: "page-1",
      workspaceId: "ws-1",
      blockType: "paragraph",
    };

    render(<SearchItemRow item={item} onSelect={vi.fn()} />);

    expect(screen.getAllByText("Block content here").length).toBeGreaterThan(0);
    // snippet parses out the type prefix
    expect(screen.getAllByText("Some content snippet").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Text").length).toBeGreaterThan(0); // RightLabel
  });

  it("renders tag item with tag badge", () => {
    const item: SearchItem = {
      id: "tag-1",
      title: "My Tag",
      category: "tag",
      pageId: "page-1",
      workspaceId: "ws-1",
      tag: {
        id: "t1",
        name: "My Tag",
        color: "red",
        metadata: {
          pageTitle: "Tag Page",
        },
      } as any,
    };

    render(<SearchItemRow item={item} onSelect={vi.fn()} />);

    expect(screen.getByTestId("tag-badge")).toBeTruthy();
    expect(screen.getAllByText("Tag Page").length).toBeGreaterThan(0);
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    const item: SearchItem = {
      id: "page-1",
      title: "Click me",
      category: "page",
      pageId: "page-1",
      workspaceId: "ws-1",
    };

    render(<SearchItemRow item={item} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("command-item"));

    expect(onSelect).toHaveBeenCalledWith(item);
  });
});
