import { describe, expect, it, beforeEach } from "vitest";
import {
  getCaretCoordinates,
  getSelectionRectangles,
  getCurrentSelectionOffsets,
} from "../cursor-coordinates";

describe("cursor-coordinates (Unit Tests)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("getCaretCoordinates", () => {
    it("returns null when container is null", () => {
      expect(getCaretCoordinates(null, 0)).toBeNull();
    });

    it("returns default coordinate geometry for empty container", () => {
      container.innerText = "";
      const coords = getCaretCoordinates(container, 0);
      expect(coords).not.toBeNull();
      expect(coords?.top).toBeDefined();
      expect(coords?.left).toBeDefined();
      expect(coords?.height).toBeGreaterThan(0);
    });

    it("computes coordinates for offset in container with text", () => {
      container.innerText = "Hello collaborative world";
      const coords = getCaretCoordinates(container, 5);
      expect(coords).not.toBeNull();
      expect(coords?.height).toBeGreaterThan(0);
    });

    it("clamps offset safely beyond text length", () => {
      container.innerText = "Short";
      const coords = getCaretCoordinates(container, 100);
      expect(coords).not.toBeNull();
    });
  });

  describe("getSelectionRectangles", () => {
    it("returns empty array when container is null", () => {
      expect(getSelectionRectangles(null, 0, 5)).toEqual([]);
    });

    it("returns empty array when startOffset >= endOffset", () => {
      container.innerText = "Some text";
      expect(getSelectionRectangles(container, 5, 2)).toEqual([]);
      expect(getSelectionRectangles(container, 3, 3)).toEqual([]);
    });

    it("does not throw on valid offsets", () => {
      container.innerText = "Collaborative selection text";
      const rects = getSelectionRectangles(container, 0, 13);
      expect(Array.isArray(rects)).toBe(true);
    });
  });

  describe("getCurrentSelectionOffsets", () => {
    it("returns null when container is null", () => {
      expect(getCurrentSelectionOffsets(null)).toBeNull();
    });

    it("returns null when nothing is selected in container", () => {
      window.getSelection()?.removeAllRanges();
      expect(getCurrentSelectionOffsets(container)).toBeNull();
    });

    it("extracts collapsed selection offset", () => {
      container.innerText = "Hello";
      const textNode = container.firstChild!;
      const range = document.createRange();
      range.setStart(textNode, 3);
      range.collapse(true);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const result = getCurrentSelectionOffsets(container);
      expect(result).not.toBeNull();
      expect(result?.offset).toBe(3);
      expect(result?.selection).toBeUndefined();
    });

    it("extracts range selection start and end", () => {
      container.innerText = "Hello world";
      const textNode = container.firstChild!;
      const range = document.createRange();
      range.setStart(textNode, 1);
      range.setEnd(textNode, 5);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const result = getCurrentSelectionOffsets(container);
      expect(result).not.toBeNull();
      expect(result?.selection).toEqual({ start: 1, end: 5 });
    });
  });
});
