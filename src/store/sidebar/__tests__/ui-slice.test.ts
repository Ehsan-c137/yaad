import { beforeEach, describe, expect, it } from "vitest";

import { useSidebarStore } from "../use-sidebar-store";

describe("sidebar ui-slice (Unit Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({
      _hasHydrated: false,
      isLoading: true,
      isSidebarOpen: true,
      activePageId: null,
    });
  });

  it("starts with the default ui state", () => {
    const state = useSidebarStore.getState();

    expect(state.isSidebarOpen).toBe(true);
    expect(state.isLoading).toBe(true);
    expect(state.activePageId).toBeNull();
    expect(state._hasHydrated).toBe(false);
  });

  it("toggles the sidebar open state", () => {
    useSidebarStore.getState().toggleSidebar();

    expect(useSidebarStore.getState().isSidebarOpen).toBe(false);

    useSidebarStore.getState().toggleSidebar();

    expect(useSidebarStore.getState().isSidebarOpen).toBe(true);
  });

  it("sets the active page id", () => {
    useSidebarStore.getState().setActivePageId("page-9");

    expect(useSidebarStore.getState().activePageId).toBe("page-9");
  });

  it("updates loading and hydration flags", () => {
    useSidebarStore.getState().setIsLoading(false);
    useSidebarStore.getState().setHasHydrated(true);

    expect(useSidebarStore.getState().isLoading).toBe(false);
    expect(useSidebarStore.getState()._hasHydrated).toBe(true);
  });
});
