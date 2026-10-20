import { render, screen } from "@testing-library/react";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { SidebarNav } from "../sidebar-nav";

describe("SidebarNav", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      activeWorkspaceId: "ws_personal",
    });
  });

  it("renders pages, graph, trash, calendar and search icons", () => {
    render(
      <MemoryRouter initialEntries={["/workspace/ws_personal"]}>
        <SidebarNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /pages/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /graph/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /trash/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /calendar/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("sets correct hrefs for active workspace", () => {
    render(
      <MemoryRouter initialEntries={["/workspace/ws_personal"]}>
        <SidebarNav />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: /pages/i }).getAttribute("href"),
    ).toBe("/workspace/ws_personal");
    expect(
      screen.getByRole("link", { name: /graph/i }).getAttribute("href"),
    ).toBe("/workspace/ws_personal/graph");
    expect(
      screen.getByRole("link", { name: /trash/i }).getAttribute("href"),
    ).toBe("/workspace/ws_personal/trash");
    expect(
      screen.getByRole("link", { name: /calendar/i }).getAttribute("href"),
    ).toBe("/workspace/ws_personal/calendar");
  });

  it("does not render when there is no active workspace", () => {
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <SidebarNav />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});
