import { fireEvent, render, screen } from "@testing-library/react";
import { INITIAL_CATEGORIES } from "@yaad/core/store/use-calendar-store";
import { describe, expect, it, vi } from "vitest";

import { CalendarMobileView } from "../calendar-mobile-view";

describe("CalendarMobileView", () => {
  const sampleEvents = [
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
  ];

  const defaultProps = {
    currentDate: new Date(2026, 9, 17),
    onSelectDate: vi.fn(),
    events: sampleEvents,
    categories: INITIAL_CATEGORIES,
    onSelectEvent: vi.fn(),
    onOpenNewEvent: vi.fn(),
    onOpenSearch: vi.fn(),
    onOpenProviders: vi.fn(),
    connectedProvidersCount: 1,
  };

  it("renders mobile app bar, view selector, and option controls", () => {
    render(<CalendarMobileView {...defaultProps} />);

    expect(screen.getAllByText("Inbox").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Search events")).toBeDefined();
    expect(screen.getByLabelText("Toggle calendar view")).toBeDefined();
    expect(screen.getByLabelText("More options")).toBeDefined();
  });

  it("renders 7-day horizontal week strip with active circle indicator", () => {
    render(<CalendarMobileView {...defaultProps} />);

    // Weekday abbreviations
    expect(screen.getAllByText("M").length).toBeGreaterThan(0);
    expect(screen.getAllByText("T").length).toBeGreaterThan(0);
    expect(screen.getAllByText("W").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S").length).toBeGreaterThan(0);

    // Selected day 17
    expect(screen.getAllByText("17").length).toBeGreaterThan(0);
  });

  it("renders agenda feed with event cards and category rings", () => {
    render(<CalendarMobileView {...defaultProps} />);

    // Check key events in initial dataset
    expect(screen.getAllByText("Plan Next Week").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Weekly Planning").length).toBeGreaterThan(0);
  });

  it("renders Floating Action Button and triggers onOpenNewEvent on tap", () => {
    const onOpenNewEvent = vi.fn();
    render(
      <CalendarMobileView
        {...defaultProps}
        onOpenNewEvent={() => void onOpenNewEvent()}
      />,
    );

    const fab = screen.getByLabelText("Add new event");
    expect(fab).toBeDefined();

    fireEvent.click(fab);
    expect(onOpenNewEvent).toHaveBeenCalled();
  });

  it("renders floating bottom dock with Inbox, Today, Upcoming, and Browse tabs", () => {
    const onOpenProviders = vi.fn();
    render(
      <CalendarMobileView
        {...defaultProps}
        onOpenProviders={() => void onOpenProviders()}
      />,
    );

    expect(screen.getByLabelText("Mobile Calendar Navigation")).toBeDefined();
    expect(screen.getAllByText("Inbox").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Today").length).toBeGreaterThan(0);
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("Browse")).toBeDefined();

    // Clicking Browse triggers provider modal
    const browseTab = screen.getByText("Browse");
    fireEvent.click(browseTab);
    expect(onOpenProviders).toHaveBeenCalled();
  });
});
