import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { documentService } from "@yaad/core/services/document-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CoverPickerModal } from "../cover-picker-modal";

vi.mock("@yaad/core/services/document-service", () => ({
  documentService: {
    saveBlob: vi.fn().mockResolvedValue(undefined),
    getBlob: vi
      .fn()
      .mockResolvedValue(new Blob(["test"], { type: "image/png" })),
    deleteBlobs: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("CoverPickerModal", () => {
  const onClose = vi.fn();
  const onSelectCover = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders presets and category filter", () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    // Paintings category button should be present
    expect(screen.getByText(/paintings/i)).toBeDefined();

    // Still Life Floral Oil painting preset should use lower resolution for preview thumbnail
    const paintingPreset = screen.getByAltText("Still Life Floral Oil");
    expect(paintingPreset).toBeDefined();
    expect(paintingPreset.getAttribute("src")).toContain("w=400");

    // Clicking a preset triggers onSelectCover with big version for cover
    fireEvent.click(paintingPreset);
    expect(onSelectCover).toHaveBeenCalledWith(
      expect.stringContaining("w=1600"),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("switches to upload tab and handles file input", async () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    // Click upload tab
    const uploadTab = screen.getByRole("tab", { name: /coverUpload|upload/i });
    fireEvent.click(uploadTab);

    // Find hidden file input in portaled dialog
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Create a mock image file with valid PNG magic bytes
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const file = new File([pngHeader, "fake-image-content"], "cover.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(documentService.saveBlob).toHaveBeenCalledWith(
        expect.stringMatching(/^blob_/),
        file,
      );
      expect(onSelectCover).toHaveBeenCalledWith(
        expect.stringMatching(/^blob_/),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("switches to link tab and applies custom url", () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    // Click link tab
    const linkTab = screen.getByRole("tab", { name: /coverLink|link/i });
    fireEvent.click(linkTab);

    // Enter link
    const input = screen.getByPlaceholderText(/pasteImageLink|paste an image/i);
    fireEvent.change(input, {
      target: { value: "https://example.com/custom-cover.jpg" },
    });

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitBtn);

    expect(onSelectCover).toHaveBeenCalledWith(
      "https://example.com/custom-cover.jpg",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("rejects svg file uploads for security", async () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    const uploadTab = screen.getByRole("tab", { name: /coverUpload|upload/i });
    fireEvent.click(uploadTab);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const svgFile = new File(['<svg onload="alert(1)"></svg>'], "test.svg", {
      type: "image/svg+xml",
    });

    fireEvent.change(fileInput, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(documentService.saveBlob).not.toHaveBeenCalled();
      expect(onSelectCover).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("rejects files with spoofed mime types (invalid magic bytes)", async () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    const uploadTab = screen.getByRole("tab", { name: /coverUpload|upload/i });
    fireEvent.click(uploadTab);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    // Spoofed file: claim to be png, but content is arbitrary text/binary
    const spoofedFile = new File(["malicious-script-content"], "fake.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [spoofedFile] } });

    await waitFor(() => {
      expect(documentService.saveBlob).not.toHaveBeenCalled();
      expect(onSelectCover).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("blocks javascript and non-http/https urls in link tab", () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    const linkTab = screen.getByRole("tab", { name: /coverLink|link/i });
    fireEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/pasteImageLink|paste an image/i);
    fireEvent.change(input, {
      target: { value: "javascript:alert('xss')" },
    });

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitBtn);

    expect(onSelectCover).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("filters presets using search query", () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      /searchPictures|search pictures/i,
    );
    fireEvent.change(searchInput, { target: { value: "hokusai" } });

    // Hokusai preset should be visible
    expect(screen.getByAltText("Ukiyo-e Woodblock Print")).toBeDefined();

    // Still Life Floral Oil should not be visible
    expect(screen.queryByAltText("Still Life Floral Oil")).toBeNull();
  });

  it("selects a surprise preset when clicking surprise me", () => {
    render(
      <CoverPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectCover={onSelectCover}
      />,
    );

    const surpriseBtn = screen.getByRole("button", {
      name: /surpriseMe|surprise picture/i,
    });
    fireEvent.click(surpriseBtn);

    expect(onSelectCover).toHaveBeenCalledWith(
      expect.stringContaining("images.unsplash.com"),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
