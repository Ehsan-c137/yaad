import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CalendarCategory, CalendarEvent } from "../types";

import { CalendarEventPopover } from "../calendar-event-popover";

const mockEvent: CalendarEvent = {
  calendarId: "work",
  date: "2026-10-20",
  description: "Review sprint deliverables and milestones",
  endTime: "11:30",
  id: "evt-test-1",
  location: "Room 101",
  reminder: "15 minutes before",
  startTime: "10:00",
  title: "Sprint Planning",
};

const mockCategory: CalendarCategory = {
  badgeBg: "#fef3c7",
  badgeBorder: "#fde68a",
  badgeText: "#92400e",
  badgeDarkBg: "#78350f",
  badgeDarkBorder: "#f59e0b",
  badgeDarkText: "#fde68a",
  checked: true,
  dotColor: "#f59e0b",
  id: "work",
  name: "Work",
};

const noop = () => {};

describe("CalendarEventPopover", () => {
  it("renders popover content with event details", () => {
    render(
      <CalendarEventPopover
        event={mockEvent}
        category={mockCategory}
        onClose={noop}
        onEdit={noop}
        onDuplicate={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByText("Sprint Planning")).toBeDefined();
    expect(screen.getByText("Work")).toBeDefined();
    expect(screen.getByText("Room 101")).toBeDefined();
    expect(screen.getByText("15 minutes before")).toBeDefined();
    expect(
      screen.getByText("Review sprint deliverables and milestones"),
    ).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();

    render(
      <CalendarEventPopover
        event={mockEvent}
        category={mockCategory}
        onClose={() => {
          handleClose();
        }}
        onEdit={noop}
        onDuplicate={noop}
        onDelete={noop}
      />,
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledWith();
  });

  it("calls onEdit when edit button is clicked", () => {
    const handleEdit = vi.fn();

    render(
      <CalendarEventPopover
        event={mockEvent}
        category={mockCategory}
        onClose={noop}
        onEdit={(evt) => {
          handleEdit(evt);
        }}
        onDuplicate={noop}
        onDelete={noop}
      />,
    );

    const editButton = screen.getByRole("button", { name: "Edit event" });
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(mockEvent);
  });

  it("calls onDuplicate when duplicate button is clicked", () => {
    const handleDuplicate = vi.fn();

    render(
      <CalendarEventPopover
        event={mockEvent}
        category={mockCategory}
        onClose={noop}
        onEdit={noop}
        onDuplicate={(evt) => {
          handleDuplicate(evt);
        }}
        onDelete={noop}
      />,
    );

    const duplicateButton = screen.getByRole("button", {
      name: "Duplicate event",
    });
    fireEvent.click(duplicateButton);

    expect(handleDuplicate).toHaveBeenCalledWith(mockEvent);
  });

  it("calls onDelete when delete button is clicked", () => {
    const handleDelete = vi.fn();

    render(
      <CalendarEventPopover
        event={mockEvent}
        category={mockCategory}
        onClose={noop}
        onEdit={noop}
        onDuplicate={noop}
        onDelete={(id) => {
          handleDelete(id);
        }}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Delete event" });
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(mockEvent.id);
  });
});
