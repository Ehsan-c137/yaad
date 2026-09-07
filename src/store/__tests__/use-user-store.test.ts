import { beforeEach, describe, expect, it } from "vitest";

import { useUserStore } from "../use-user-store";

describe("useUserStore (Unit Test)", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      userName: null,
      hasOnboarded: false,
      _hasHydrated: false,
    });
  });

  it("starts with an anonymous, non-onboarded user", () => {
    const state = useUserStore.getState();

    expect(state.userName).toBeNull();
    expect(state.hasOnboarded).toBe(false);
  });

  it("stores the user name", () => {
    useUserStore.getState().setUserName("Ehsan");

    expect(useUserStore.getState().userName).toBe("Ehsan");
  });

  it("clears the user name with null", () => {
    useUserStore.getState().setUserName("Ehsan");

    useUserStore.getState().setUserName(null);

    expect(useUserStore.getState().userName).toBeNull();
  });

  it("marks onboarding as complete", () => {
    useUserStore.getState().completeOnboarding();

    expect(useUserStore.getState().hasOnboarded).toBe(true);
  });

  it("persists the state to localStorage", () => {
    useUserStore.getState().setUserName("Ehsan");
    useUserStore.getState().completeOnboarding();

    const raw = localStorage.getItem("yaad-user-storage");

    expect(raw).toBeTruthy();

    const persisted = JSON.parse(raw!) as {
      state: { userName: string | null; hasOnboarded: boolean };
    };

    expect(persisted.state.userName).toBe("Ehsan");
    expect(persisted.state.hasOnboarded).toBe(true);
  });
});
