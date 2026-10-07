import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageHeaderCover } from "../page-header-cover";

let mockCoverImage: string | undefined;
const mockUpdateCoverImage = vi.fn();
const mockRemoveCoverImage = vi.fn();

vi.mock("@/hooks/editor/use-document-store-ui", () => ({
  useDocumentStore: (selector: any) =>
    selector({
      currentDocument: mockCoverImage
        ? { coverImage: mockCoverImage }
        : undefined,
      updateCoverImage: mockUpdateCoverImage,
      removeCoverImage: mockRemoveCoverImage,
    }),
}));

vi.mock("../cover-picker-modal", () => ({
  CoverPickerModal: ({
    isOpen,
    onSelectCover,
  }: {
    isOpen: boolean;
    onSelectCover: (url: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="cover-picker-modal">
        <button
          type="button"
          onClick={() => onSelectCover("https://img.example/selected.png")}
        >
          Select Cover
        </button>
      </div>
    ) : null,
}));

let mockResolutionResult = {
  displayUrl: undefined as string | undefined,
  status: "idle",
  setImageLoaded: vi.fn(),
  setImageError: vi.fn(),
  retry: vi.fn(),
};

vi.mock("../use-cover-resolution", () => ({
  useCoverResolution: () => mockResolutionResult,
}));

describe("PageHeaderCover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCoverImage = undefined;
    mockResolutionResult = {
      displayUrl: undefined,
      status: "idle",
      setImageLoaded: vi.fn(),
      setImageError: vi.fn(),
      retry: vi.fn(),
    };
  });

  it("renders 'add cover' button when no cover image exists", () => {
    render(<PageHeaderCover />);

    expect(screen.getByRole("button", { name: /add cover/i })).toBeDefined();
    expect(screen.queryByLabelText(/page cover/i)).toBeNull();
  });

  it("opens CoverPickerModal when 'add cover' button is clicked", () => {
    render(<PageHeaderCover />);

    fireEvent.click(screen.getByRole("button", { name: /add cover/i }));

    expect(screen.getByTestId("cover-picker-modal")).toBeDefined();

    fireEvent.click(screen.getByText("Select Cover"));

    expect(mockUpdateCoverImage).toHaveBeenCalledWith(
      "https://img.example/selected.png",
    );
  });

  it("renders skeleton while resolving or loading cover image", () => {
    mockCoverImage = "https://img.example/cover.png";
    mockResolutionResult = {
      displayUrl: "https://img.example/cover.png",
      status: "loading",
      setImageLoaded: vi.fn(),
      setImageError: vi.fn(),
      retry: vi.fn(),
    };

    const { container } = render(<PageHeaderCover />);

    expect(
      container.querySelector('[data-slot="cover-skeleton"]'),
    ).toBeDefined();
  });

  it("renders cover image and action buttons when loaded", () => {
    mockCoverImage = "https://img.example/cover.png";
    mockResolutionResult = {
      displayUrl: "https://img.example/cover.png",
      status: "loaded",
      setImageLoaded: vi.fn(),
      setImageError: vi.fn(),
      retry: vi.fn(),
    };

    render(<PageHeaderCover />);

    expect(screen.getByAltText(/page cover/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /change cover/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /remove/i })).toBeDefined();
  });

  it("calls removeCoverImage when remove cover button is clicked", () => {
    mockCoverImage = "https://img.example/cover.png";
    mockResolutionResult = {
      displayUrl: "https://img.example/cover.png",
      status: "loaded",
      setImageLoaded: vi.fn(),
      setImageError: vi.fn(),
      retry: vi.fn(),
    };

    render(<PageHeaderCover />);

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(mockRemoveCoverImage).toHaveBeenCalledWith();
  });

  it("displays error fallback with retry button when image fails to load", () => {
    mockCoverImage = "blob_invalid";
    mockResolutionResult = {
      displayUrl: undefined,
      status: "error",
      setImageLoaded: vi.fn(),
      setImageError: vi.fn(),
      retry: vi.fn(),
    };

    render(<PageHeaderCover />);

    expect(screen.getByText(/image not loaded/i)).toBeDefined();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(mockResolutionResult.retry).toHaveBeenCalledWith();
  });
});
