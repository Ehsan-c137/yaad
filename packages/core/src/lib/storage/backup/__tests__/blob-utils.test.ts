import { describe, expect, it } from "vitest";

import { blobToDataUrl, dataUrlToBlob } from "../blob-utils";

describe("backup blob utilities (Unit Test)", () => {
  it("round-trips a text blob through a data url", async () => {
    const blob = new Blob(["yaad backup"], { type: "text/plain" });

    const dataUrl = await blobToDataUrl(blob);

    expect(dataUrl).toMatch(/^data:text\/plain;base64,/);

    const restored = dataUrlToBlob(dataUrl);

    expect(restored.type).toBe("text/plain");
    await expect(restored.text()).resolves.toBe("yaad backup");
  });

  it("falls back to application/octet-stream when the mime type is missing", () => {
    const restored = dataUrlToBlob("data:,aGVsbG8=");

    expect(restored.type).toBe("application/octet-stream");
  });

  it("preserves binary content byte for byte", async () => {
    const bytes = Uint8Array.from([0, 1, 2, 250, 251, 255]);
    const blob = new Blob([bytes], { type: "application/octet-stream" });

    const restored = dataUrlToBlob(await blobToDataUrl(blob));
    const restoredBytes = new Uint8Array(await restored.arrayBuffer());

    expect(Array.from(restoredBytes)).toEqual(Array.from(bytes));
  });
});
