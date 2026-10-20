import { render, screen } from "@testing-library/react";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import { beforeEach, describe, expect, it } from "vitest";

import { DaymarkCalendar } from "../daymark-calendar";

describe("DaymarkCalendar", () => {
  beforeEach(() => {
    useCalendarStore.setState({
      currentDateStr: "2026-10-17",
      events: [
        {
          id: "evt-1",
          title: "Plan Next Week",
          calendarId: "work",
          date: "2026-10-17",
          startTime: "09:00",
          endTime: "10:00",
        },
        {
          id: "evt-2",
          title: "Weekly Planning",
          calendarId: "work",
          date: "2026-10-17",
          startTime: "11:00",
          endTime: "12:00",
        },
      ],
    });
  });
  it("renders the calendar component container", () => {
    const { container } = render(<DaymarkCalendar />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders header with month, week label, and action buttons", () => {
    render(<DaymarkCalendar />);

    expect(screen.getAllByText("October 2026").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /new event/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "day" })).toBeDefined();
    expect(screen.getByRole("button", { name: "week" })).toBeDefined();
    expect(screen.getByRole("button", { name: "month" })).toBeDefined();
  });

  it("renders key events on the grid including Plan Next Week and Weekly Planning", () => {
    render(<DaymarkCalendar />);

    const planEvents = screen.getAllByText("Plan Next Week");
    expect(planEvents.length).toBeGreaterThan(0);

    const weeklyPlannings = screen.getAllByText("Weekly Planning");
    expect(weeklyPlannings.length).toBeGreaterThan(0);
  });

  it("renders right sidebar with Upcoming section", () => {
    render(<DaymarkCalendar />);

    const upcomingHeaders = screen.getAllByText("Upcoming");
    expect(upcomingHeaders.length).toBeGreaterThan(0);
    expect(screen.getByText("Next 7 days")).toBeDefined();
    expect(screen.getByText("Today, Sat 17")).toBeDefined();
  });
});
