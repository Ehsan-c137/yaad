import { describe, expect, it } from "vitest";

import { buildBlockAnchorUrl } from "../block-links";

describe("buildBlockAnchorUrl (Unit Test)", () => {
  it("appends the block id as the URL hash", () => {
    const url = buildBlockAnchorUrl(
      "block_123",
      "https://yaad.app/workspace/ws1/page1",
    );

    expect(url).toBe("https://yaad.app/workspace/ws1/page1#block_123");
  });

  it("replaces an existing hash with the new block id", () => {
    const url = buildBlockAnchorUrl(
      "block_456",
      "https://yaad.app/page#old-block",
    );

    expect(url).toBe("https://yaad.app/page#block_456");
  });

  it("preserves query parameters and path", () => {
    const url = buildBlockAnchorUrl(
      "block_1",
      "https://yaad.app/workspace/ws/page?p=1&q=2",
    );

    expect(url).toBe("https://yaad.app/workspace/ws/page?p=1&q=2#block_1");
  });

  it("defaults the base href to the current location", () => {
    const url = buildBlockAnchorUrl("block_default");

    expect(url).toContain(window.location.origin);
    expect(url.endsWith("#block_default")).toBe(true);
  });
});
