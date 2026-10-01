import "@/i18n";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const mockStore = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: vi.fn((key: string) => Promise.resolve(mockStore.get(key))),
  set: vi.fn((key: string, val: unknown) => {
    mockStore.set(key, val);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
  keys: vi.fn(() => Promise.resolve(Array.from(mockStore.keys()))),
}));

afterEach(() => {
  cleanup();
});
