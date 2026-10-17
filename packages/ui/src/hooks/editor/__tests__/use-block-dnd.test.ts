import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetBlockDndState, useBlockDnd } from "../use-block-dnd";
import { useDocumentStore } from "../use-document-store-ui";

vi.mock("../use-document-store-ui");

describe("useBlockDnd (Unit Test)", () => {
  const moveBlockMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetBlockDndState();

    vi.mocked(useDocumentStore).mockImplementation((selector: any) => {
      const state = {
        moveBlock: moveBlockMock,
        currentDocument: {
          id: "page1",
          blocks: {
            root: {
              id: "root",
              type: "page",
              parentId: null,
              childrenIds: ["b1", "b2"],
            },
            b1: {
              id: "b1",
              type: "paragraph",
              parentId: "root",
              childrenIds: [],
            },
            b2: {
              id: "b2",
              type: "paragraph",
              parentId: "root",
              childrenIds: [],
            },
          },
        },
      };
      return selector(state);
    });
  });

  it("initializes with idle DnD state", () => {
    const { result } = renderHook(() => useBlockDnd("b1", false));

    expect(result.current.isDragging).toBe(false);
    expect(result.current.isDropTarget).toBe(false);
    expect(result.current.activePosition).toBeNull();
  });

  it("handles drag start by setting dataTransfer and dragged block ID", () => {
    const { result } = renderHook(() => useBlockDnd("b1", false));

    const setData = vi.fn();
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        setData,
        effectAllowed: "none",
      },
    } as unknown as React.DragEvent<HTMLElement>;

    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    expect(setData).toHaveBeenCalledWith("application/x-yaad-block", "b1");
    expect(setData).toHaveBeenCalledWith("text/plain", "b1");
    expect(result.current.isDragging).toBe(true);
  });

  it("prevents drag start when read-only", () => {
    const { result } = renderHook(() => useBlockDnd("b1", true));

    const preventDefault = vi.fn();
    const setData = vi.fn();
    const mockEvent = {
      preventDefault,
      dataTransfer: { setData },
    } as unknown as React.DragEvent<HTMLElement>;

    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(setData).not.toHaveBeenCalled();
    expect(result.current.isDragging).toBe(false);
  });

  it("computes 'before' position on drag over top half and 'after' on bottom half", () => {
    const { result: dnd1 } = renderHook(() => useBlockDnd("b1", false));
    const { result: dnd2 } = renderHook(() => useBlockDnd("b2", false));

    // Drag start on b1
    act(() => {
      dnd1.current.handleDragStart({
        preventDefault: vi.fn(),
        dataTransfer: { setData: vi.fn(), effectAllowed: "none" },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    // Hover over top 20% of b2 (height = 100, top = 50, clientY = 70 => offset = 20)
    const mockTarget = {
      getBoundingClientRect: () => ({ top: 50, height: 100 }),
    };

    act(() => {
      dnd2.current.handleDragOver({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: mockTarget,
        clientY: 70,
        dataTransfer: {
          getData: () => "b1",
          dropEffect: "none",
        },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(dnd2.current.isDropTarget).toBe(true);
    expect(dnd2.current.activePosition).toBe("before");

    // Hover over bottom 80% of b2 (clientY = 130 => offset = 80)
    act(() => {
      dnd2.current.handleDragOver({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: mockTarget,
        clientY: 130,
        dataTransfer: {
          getData: () => "b1",
          dropEffect: "none",
        },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(dnd2.current.activePosition).toBe("after");
  });

  it("calls moveBlock and resets DnD state on drop", () => {
    const { result: dnd1 } = renderHook(() => useBlockDnd("b1", false));
    const { result: dnd2 } = renderHook(() => useBlockDnd("b2", false));

    // Drag start b1
    act(() => {
      dnd1.current.handleDragStart({
        preventDefault: vi.fn(),
        dataTransfer: { setData: vi.fn(), effectAllowed: "none" },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    // Drag over b2 (top half -> before)
    act(() => {
      dnd2.current.handleDragOver({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: {
          getBoundingClientRect: () => ({ top: 0, height: 100 }),
        },
        clientY: 20,
        dataTransfer: { getData: () => "b1", dropEffect: "none" },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    // Drop on b2
    act(() => {
      dnd2.current.handleDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { getData: () => "b1" },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(moveBlockMock).toHaveBeenCalledWith("b1", "b2", "before");
    expect(dnd1.current.isDragging).toBe(false);
    expect(dnd2.current.isDropTarget).toBe(false);
  });
});
