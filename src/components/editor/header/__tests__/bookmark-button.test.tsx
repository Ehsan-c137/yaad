import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSidebarStore } from "@/store/use-sidebar-store";

import { BookmarkButton } from "../bookmark-button";

vi.mock("next/navigation", () => ({
  useParams: () => ({ pageId: "page-1" }),
}));

describe("BookmarkButton (Integration Test)", () => {
  beforeEach(() => {
    useSidebarStore.setState({
      pages: {
        "page-1": {
          id: "page-1",
          title: "Sample Page",
          icon: "📝",
          parentId: null,
          childrenIds: [],
          isExpanded: false,
          isBookmarked: false,
          isDeleted: false,
          updatedAt: new Date().getTime(),
        },
      },
      toggleBookmarked: vi.fn((pageId: string) => {
        useSidebarStore.setState((state) => ({
          pages: {
            ...state.pages,
            [pageId]: {
              ...state.pages[pageId]!,
              isBookmarked: !state.pages[pageId]?.isBookmarked,
            },
          },
        }));
      }),
    });
  });

  it("renders 'Add to bookmarks' title when unbookmarked and toggles on click", () => {
    render(<BookmarkButton />);

    const button = screen.getByRole("button", { name: /add to bookmarks/i });

    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // After click, state should update and title should change to 'Remove from bookmarks'
    expect(
      screen.getByRole("button", { name: /remove from bookmarks/i }),
    ).toBeInTheDocument();
  });
});
