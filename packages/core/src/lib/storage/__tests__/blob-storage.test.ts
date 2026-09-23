import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { blobStorage } from "../blob-storage";

const idb = vi.hoisted(() => {
  const store = new Map<string, unknown>();

  return {
    store,
    get: (key: string) => Promise.resolve(store.get(key)),
    set: (key: string, value: unknown) => {
      store.set(key, value);

      return Promise.resolve();
    },
    del: (key: string) => {
      store.delete(key);

      return Promise.resolve();
    },
  };
});

vi.mock("idb-keyval", () => idb);

describe("blobStorage (Integration Test)", () => {
  beforeEach(() => {
    idb.store.clear();
  });

  afterEach(() => {
    idb.store.clear();
  });

  it("saves and reads blobs under the blob key prefix", async () => {
    const blob = new Blob(["binary-ish"], { type: "application/zip" });

    await blobStorage.save("asset-1", blob);

    expect(idb.store.has("blob_asset-1")).toBe(true);

    const restored = await blobStorage.get("asset-1");

    expect(restored?.type).toBe("application/zip");
    await expect(restored?.text()).resolves.toBe("binary-ish");
  });

  it("returns undefined for missing blobs", async () => {
    await expect(blobStorage.get("ghost")).resolves.toBeUndefined();
  });

  it("removes blobs", async () => {
    await blobStorage.save("asset-1", new Blob(["x"]));

    await blobStorage.remove("asset-1");

    expect(idb.store.has("blob_asset-1")).toBe(false);
    await expect(blobStorage.get("asset-1")).resolves.toBeUndefined();
  });
});
