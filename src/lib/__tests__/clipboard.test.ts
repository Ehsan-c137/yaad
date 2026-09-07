import { afterEach, describe, expect, it, vi } from "vitest";

import { copyTextToClipboard } from "../clipboard";

describe("copyTextToClipboard (Unit Test)", () => {
  const writeText = vi.fn<(text: string) => Promise<void>>();

  afterEach(() => {
    vi.unstubAllGlobals();
    writeText.mockReset();
  });

  it("delegates to navigator.clipboard.writeText", async () => {
    writeText.mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await copyTextToClipboard("hello yaad");

    expect(writeText).toHaveBeenCalledWith("hello yaad");
  });

  it("propagates clipboard failures to the caller", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("oops")).rejects.toThrow("denied");
  });
});
