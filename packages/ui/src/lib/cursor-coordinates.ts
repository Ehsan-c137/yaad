/**
 * Utilities for computing pixel coordinates of remote cursors and selection ranges
 * within a contentEditable element.
 */

export interface CursorCoordinates {
  top: number;
  left: number;
  height: number;
}

export interface SelectionRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Finds the DOM node and local offset corresponding to a character offset inside a container.
 */
function findNodeAndOffset(
  container: Node,
  targetOffset: number,
): { node: Node; offset: number } | null {
  let accumulated = 0;

  function traverse(current: Node): { node: Node; offset: number } | null {
    if (current.nodeType === Node.TEXT_NODE) {
      const len = current.textContent?.length ?? 0;

      if (accumulated + len >= targetOffset) {
        return {
          node: current,
          offset: Math.max(0, targetOffset - accumulated),
        };
      }

      accumulated += len;
      return null;
    }

    if (current.nodeName === "BR") {
      if (accumulated >= targetOffset) {
        return { node: current.parentNode ?? current, offset: 0 };
      }

      accumulated += 1;
      return null;
    }

    for (const child of Array.from(current.childNodes)) {
      const res = traverse(child);
      if (res) return res;
    }

    return null;
  }

  const result = traverse(container);
  if (result) return result;

  // If target offset is at or beyond the total length, pick the last leaf node
  if (container.lastChild) {
    let last: Node = container.lastChild;

    while (last.lastChild) {
      last = last.lastChild;
    }

    const len = last.textContent?.length ?? 0;
    return { node: last, offset: len };
  }

  return { node: container, offset: 0 };
}

/**
 * Computes the pixel coordinates (relative to the container) for a given character offset.
 */
export function getCaretCoordinates(
  container: HTMLElement | null,
  offset: number,
): CursorCoordinates | null {
  if (!container) return null;

  const containerRect = container.getBoundingClientRect();
  const text = container.innerText ?? "";
  const clampedOffset = Math.max(0, Math.min(offset, text.length));

  // If container is empty or has no child nodes
  if (text.length === 0 || container.childNodes.length === 0) {
    const computed = window.getComputedStyle(container);
    const fontSize = parseFloat(computed.fontSize) || 16;
    const isRtl = computed.direction === "rtl";
    const paddingLeft = parseFloat(computed.paddingLeft) || 0;
    const paddingRight = parseFloat(computed.paddingRight) || 0;
    const paddingTop = parseFloat(computed.paddingTop) || 0;

    return {
      top: paddingTop,
      left: isRtl ? container.clientWidth - paddingRight : paddingLeft,
      height: fontSize * 1.25,
    };
  }

  const target = findNodeAndOffset(container, clampedOffset);
  if (!target) return null;

  try {
    const range = document.createRange();
    range.setStart(target.node, target.offset);
    range.collapse(true);

    let rect = range.getBoundingClientRect();

    if (rect.height === 0) {
      const clientRects = range.getClientRects();

      if (clientRects.length > 0) {
        rect = clientRects[0];
      }
    }

    // Fallback: span adjacent character to determine line height and position
    if (rect.height === 0) {
      if (target.offset > 0) {
        range.setStart(target.node, target.offset - 1);
        range.setEnd(target.node, target.offset);
        const spanRect = range.getBoundingClientRect();

        if (spanRect.height > 0) {
          return {
            top: spanRect.top - containerRect.top,
            left: spanRect.right - containerRect.left,
            height: spanRect.height,
          };
        }
      } else if (
        target.node.textContent &&
        target.offset < target.node.textContent.length
      ) {
        range.setStart(target.node, target.offset);
        range.setEnd(target.node, target.offset + 1);
        const spanRect = range.getBoundingClientRect();

        if (spanRect.height > 0) {
          return {
            top: spanRect.top - containerRect.top,
            left: spanRect.left - containerRect.left,
            height: spanRect.height,
          };
        }
      }
    }

    if (rect.height === 0) {
      const computed = window.getComputedStyle(container);
      const fontSize = parseFloat(computed.fontSize) || 16;
      return {
        top: 0,
        left: 0,
        height: fontSize * 1.25,
      };
    }

    return {
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      height: rect.height,
    };
  } catch {
    return null;
  }
}

/**
 * Computes bounding rectangles for each line of text covered by a selection range.
 */
export function getSelectionRectangles(
  container: HTMLElement | null,
  startOffset: number,
  endOffset: number,
): SelectionRectangle[] {
  if (!container || startOffset >= endOffset) return [];

  const containerRect = container.getBoundingClientRect();
  const text = container.innerText ?? "";
  const start = Math.max(0, Math.min(startOffset, text.length));
  const end = Math.max(0, Math.min(endOffset, text.length));
  if (start >= end) return [];

  const startTarget = findNodeAndOffset(container, start);
  const endTarget = findNodeAndOffset(container, end);
  if (!startTarget || !endTarget) return [];

  try {
    const range = document.createRange();
    range.setStart(startTarget.node, startTarget.offset);
    range.setEnd(endTarget.node, endTarget.offset);

    const clientRects = Array.from(range.getClientRects());
    return clientRects
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({
        top: r.top - containerRect.top,
        left: r.left - containerRect.left,
        width: r.width,
        height: r.height,
      }));
  } catch {
    return [];
  }
}

/**
 * Extracts current caret offset and optional selection range for the focused container.
 */
export function getCurrentSelectionOffsets(
  container: HTMLElement | null,
): { offset: number; selection?: { start: number; end: number } } | null {
  if (!container) return null;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!container.contains(range.startContainer)) return null;

  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(container);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const start = preCaretRange.toString().length;

  if (sel.isCollapsed) {
    return { offset: start };
  }

  const preEndRange = range.cloneRange();
  preEndRange.selectNodeContents(container);
  preEndRange.setEnd(range.endContainer, range.endOffset);
  const end = preEndRange.toString().length;

  const min = Math.min(start, end);
  const max = Math.max(start, end);

  return {
    offset: end,
    selection: min !== max ? { start: min, end: max } : undefined,
  };
}
