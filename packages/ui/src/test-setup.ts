import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const mockStore = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: vi.fn(async (key: string) => mockStore.get(key)),
  set: vi.fn(async (key: string, val: unknown) => {
    mockStore.set(key, val);
  }),
  del: vi.fn(async (key: string) => {
    mockStore.delete(key);
  }),
  keys: vi.fn(async () => Array.from(mockStore.keys())),
}));

afterEach(() => {
  cleanup();
});
