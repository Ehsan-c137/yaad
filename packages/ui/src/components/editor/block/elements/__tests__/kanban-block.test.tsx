import type { DocumentBlock } from "@yaad/core/types/document";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KanbanBlock } from "../kanban-block/kanban-block";

vi.mock("@/context/use-editor-context", () => ({
  useEditorPageIdContext: () => "test-page-id",
}));

vi.mock("@/hooks/editor/use-document-store-ui", () => ({
  useDocumentStore: (selector: any) =>
    selector({
      updateBlockProperties: vi.fn(),
    }),
}));

describe("KanbanBlock Component (Unit Test)", () => {
  const mockBlock: DocumentBlock = {
    id: "kanban-1",
    type: "kanban",
    parentId: "root",
    childrenIds: [],
    properties: {
      columns: [
        { id: "col-1", title: "To Do" },
        { id: "col-2", title: "In Progress" },
      ],
      cards: [
        { id: "card-1", columnId: "col-1", title: "Design mockup" },
        { id: "card-2", columnId: "col-2", title: "Implement UI" },
      ],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it("renders columns and cards correctly", () => {
    render(<KanbanBlock block={mockBlock} />);

    expect(screen.getByText("To Do")).toBeTruthy();
    expect(screen.getByText("In Progress")).toBeTruthy();
    expect(screen.getByText("Design mockup")).toBeTruthy();
    expect(screen.getByText("Implement UI")).toBeTruthy();
  });

  it("displays card count badges per column", () => {
    render(<KanbanBlock block={mockBlock} />);

    const badges = screen.getAllByText("1");

    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("renders add card and add column action buttons", () => {
    render(<KanbanBlock block={mockBlock} />);

    expect(screen.getAllByText("Add column").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Add card").length).toBeGreaterThanOrEqual(2);
  });
});
