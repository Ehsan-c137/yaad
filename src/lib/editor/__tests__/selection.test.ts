import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getCaretOffset, setCaretOffset } from "../selection";

describe("editor selection helpers (Unit Test)", () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement("div");
    element.textContent = "hello world";
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    window.getSelection()?.removeAllRanges();
  });

  it("returns 0 when there is no active selection", () => {
    window.getSelection()?.removeAllRanges();

    expect(getCaretOffset(element)).toBe(0);
  });

  it("round-trips a caret offset in the middle of the content", () => {
    setCaretOffset(element, 5);

    expect(getCaretOffset(element)).toBe(5);
  });

  it("round-trips a caret offset at the end of the content", () => {
    setCaretOffset(element, "hello world".length);

    expect(getCaretOffset(element)).toBe("hello world".length);
  });

  it("measures the offset relative to the given element", () => {
    const wrapper = document.createElement("div");
    wrapper.textContent = "prefix";
    wrapper.appendChild(element);
    document.body.appendChild(wrapper);

    try {
      setCaretOffset(element, 3);

      expect(getCaretOffset(element)).toBe(3);
    } finally {
      wrapper.remove();
    }
  });
});
