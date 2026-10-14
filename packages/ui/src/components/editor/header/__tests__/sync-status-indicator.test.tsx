import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { SyncStatusIndicator } from "../sync-status-indicator";
import * as useSyncStatusModule from "@/hooks/editor/use-sync-status";

describe("SyncStatusIndicator (Unit Tests)", () => {
  it("renders saved state with checkmark and label", () => {
    vi.spyOn(useSyncStatusModule, "useSyncStatus").mockReturnValue({
      saveState: "saved",
      pendingCount: 0,
      syncWorkerStatus: "idle",
      collabStatus: "connected",
      triggerSync: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByTestId("sync-status-saved")).toBeDefined();
    expect(screen.getByText("Saved")).toBeDefined();
  });

  it("renders syncing state with spinner", () => {
    vi.spyOn(useSyncStatusModule, "useSyncStatus").mockReturnValue({
      saveState: "syncing",
      pendingCount: 2,
      syncWorkerStatus: "syncing",
      collabStatus: "connected",
      triggerSync: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByTestId("sync-status-syncing")).toBeDefined();
  });

  it("renders offline state with pending mutation count", () => {
    vi.spyOn(useSyncStatusModule, "useSyncStatus").mockReturnValue({
      saveState: "offline",
      pendingCount: 4,
      syncWorkerStatus: "offline",
      collabStatus: "disconnected",
      triggerSync: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByTestId("sync-status-offline")).toBeDefined();
    expect(screen.getByText(/4 pending sync/i)).toBeDefined();
  });

  it("renders error state and invokes triggerSync on click", () => {
    const triggerSync = vi.fn();
    vi.spyOn(useSyncStatusModule, "useSyncStatus").mockReturnValue({
      saveState: "error",
      pendingCount: 0,
      syncWorkerStatus: "error",
      collabStatus: "connected",
      triggerSync,
    });

    render(<SyncStatusIndicator />);
    const errorBtn = screen.getByTestId("sync-status-error");
    expect(errorBtn).toBeDefined();

    fireEvent.click(errorBtn);
    expect(triggerSync).toHaveBeenCalledTimes(1);
  });
});
