import { act, renderHook, waitFor } from "@testing-library/react";
import { documentService } from "@yaad/core/services/document-service";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCoverResolution } from "../use-cover-resolution";

vi.mock("@yaad/core/services/document-service", () => ({
  documentService: {
    getBlob: vi.fn(),
  },
}));

describe("useCoverResolution", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn((blob: Blob) => `blob:mock-url-${blob.size}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("returns idle status and undefined url when coverImage is empty", () => {
    const { result } = renderHook(() => useCoverResolution(undefined));

    expect(result.current.status).toBe("idle");
    expect(result.current.displayUrl).toBeUndefined();
  });

  it("handles remote HTTP URL directly without calling documentService", () => {
    const { result } = renderHook(() =>
      useCoverResolution("https://images.unsplash.com/photo-1"),
    );

    expect(result.current.status).toBe("loading");
    expect(result.current.displayUrl).toBe(
      "https://images.unsplash.com/photo-1",
    );
    expect(documentService.getBlob).not.toHaveBeenCalled();

    act(() => {
      result.current.setImageLoaded();
    });

    expect(result.current.status).toBe("loaded");
  });

  it("resolves blob_ ID into object URL and manages its lifecycle", async () => {
    const mockBlob = new Blob(["image-bytes"], { type: "image/png" });
    vi.mocked(documentService.getBlob).mockResolvedValue(mockBlob);

    const { result, unmount } = renderHook(() =>
      useCoverResolution("blob_test_123"),
    );

    expect(result.current.status).toBe("resolving");
    expect(documentService.getBlob).toHaveBeenCalledWith("blob_test_123");

    await waitFor(() => {
      expect(result.current.status).toBe("loading");
      expect(result.current.displayUrl).toContain("blob:mock-url");
    });

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      expect.stringContaining("blob:mock-url"),
    );
  });

  it("handles missing or rejected blob by setting error status", async () => {
    vi.mocked(documentService.getBlob).mockResolvedValue(null);

    const { result } = renderHook(() => useCoverResolution("blob_missing"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.displayUrl).toBeUndefined();
    });
  });

  it("retry allows re-attempting resolution after failure", async () => {
    vi.mocked(documentService.getBlob)
      .mockRejectedValueOnce(new Error("Network failed"))
      .mockResolvedValueOnce(new Blob(["ok"], { type: "image/png" }));

    const { result } = renderHook(() => useCoverResolution("blob_retry"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("loading");
      expect(result.current.displayUrl).toBeDefined();
    });
  });
});
