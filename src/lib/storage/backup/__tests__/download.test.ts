import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { YaadExportPayload } from "../types";

import { triggerDownloadJSON } from "../download";

const payload: YaadExportPayload = {
  app: "yaad",
  data: {
    blobs: [],
    documents: {},
    inbox: [],
    tabs: [],
    trees: {},
    workspaces: [],
  },
  exportedAt: 0,
  version: 1,
};

describe("triggerDownloadJSON (Unit Test)", () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:mock-url");
  const revokeObjectURL = vi.fn();
  let clickedAnchors: HTMLAnchorElement[] = [];
  let originalCreate: typeof URL.createObjectURL | undefined;
  let originalRevoke: typeof URL.revokeObjectURL | undefined;
  let originalClick: typeof HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    originalCreate = URL.createObjectURL;
    originalRevoke = URL.revokeObjectURL;
    originalClick = HTMLAnchorElement.prototype.click;

    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL;

    clickedAnchors = [];

    HTMLAnchorElement.prototype.click = function clicked(
      this: HTMLAnchorElement,
    ) {
      clickedAnchors.push(this);
    };

    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate!;
    URL.revokeObjectURL = originalRevoke!;
    HTMLAnchorElement.prototype.click = originalClick;
  });

  it("downloads the payload with a date-stamped default filename", () => {
    triggerDownloadJSON(payload);

    expect(clickedAnchors).toHaveLength(1);

    const expectedDate = new Date().toISOString().split("T")[0];

    expect(clickedAnchors[0]?.download).toBe(
      `yaad-backup-${expectedDate}.json`,
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("uses the provided filename when given", () => {
    triggerDownloadJSON(payload, "my-backup.json");

    expect(clickedAnchors[0]?.download).toBe("my-backup.json");
  });

  it("serializes the payload as pretty-printed JSON", async () => {
    triggerDownloadJSON(payload);

    const blob = createObjectURL.mock.calls[0]?.[0];

    await expect(blob.text()).resolves.toContain('"app": "yaad"');
    await expect(blob.text()).resolves.toContain('"version": 1');
  });
});
