import { describe, expect, it } from "vitest";

import {
  generateBlockId,
  generateCardId,
  generatePageId,
  generateWorkspaceId,
} from "../id";

describe("ID Generators (Unit Test)", () => {
  it("generates page IDs with page_ prefix", () => {
    const id = generatePageId();

    expect(id).toMatch(/^page_[-0-9a-f]+$/);
  });

  it("generates block IDs with block_ prefix", () => {
    const id = generateBlockId();

    expect(id).toMatch(/^block_[-0-9a-f]+$/);
  });

  it("generates workspace IDs with ws_ prefix", () => {
    const id = generateWorkspaceId();

    expect(id).toMatch(/^ws_[-0-9a-f]+$/);
  });

  it("generates card IDs with card_ prefix", () => {
    const id = generateCardId();

    expect(id).toMatch(/^card_[-0-9a-f]+$/);
  });

  it("generates unique IDs", () => {
    const id1 = generatePageId();
    const id2 = generatePageId();

    expect(id1).not.toBe(id2);
  });
});
