import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn (Unit Test)", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", false && "c", undefined, "d")).toBe("a b d");
  });

  it("merges conflicting tailwind classes keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting tailwind classes", () => {
    expect(cn("px-2", "py-3")).toBe("px-2 py-3");
  });

  it("supports conditional objects and arrays", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });

  it("returns an empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
