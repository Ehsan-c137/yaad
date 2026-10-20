import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SidebarCalendar } from "../sidebar-calendar";

describe("SidebarCalendar", () => {
  it("renders calendar navigation tabs and My calendars section", () => {
    render(
      <MemoryRouter initialEntries={["/workspace/ws_personal/calendar"]}>
        <SidebarCalendar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Calendar")).toBeDefined();
    expect(screen.getByText("Today")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("Tasks")).toBeDefined();
    expect(screen.getByText("My calendars")).toBeDefined();

    // Check categories
    expect(screen.getByText("Work")).toBeDefined();
    expect(screen.getByText("Meetings")).toBeDefined();
    expect(screen.getByText("Focus time")).toBeDefined();
    expect(screen.getByText("Personal")).toBeDefined();
    expect(screen.getByText("Social")).toBeDefined();
    expect(screen.getByText("Reminders")).toBeDefined();
  });
});
