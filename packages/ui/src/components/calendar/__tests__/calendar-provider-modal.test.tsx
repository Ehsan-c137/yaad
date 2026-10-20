import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarProviderModal } from "../calendar-provider-modal";

describe("CalendarProviderModal", () => {
  it("renders when isOpen is true and shows provider tabs", () => {
    render(
      <CalendarProviderModal
        isOpen={true}
        onClose={() => {
          void vi.fn();
        }}
      />,
    );

    expect(screen.getByText("Calendar Integrations & Providers")).toBeDefined();
    expect(screen.getByText("Google Calendar")).toBeDefined();
    expect(screen.getByText("iCal / Webcal Feed")).toBeDefined();
    expect(screen.getByText("Import & Export (.ics)")).toBeDefined();
    expect(screen.getByText(/Connected \(\d+\)/)).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CalendarProviderModal
        isOpen={false}
        onClose={() => {
          void vi.fn();
        }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("allows switching to iCal feed tab and displays form", () => {
    render(
      <CalendarProviderModal
        isOpen={true}
        onClose={() => {
          void vi.fn();
        }}
      />,
    );

    const icalTab = screen.getByRole("button", {
      name: /ical \/ webcal feed/i,
    });
    fireEvent.click(icalTab);

    expect(screen.getByText("Subscribe to Calendar Feed")).toBeDefined();
    expect(screen.getByPlaceholderText(/basic\.ics/i)).toBeDefined();
  });

  it("allows switching to Import & Export tab and shows export buttons", () => {
    render(
      <CalendarProviderModal
        isOpen={true}
        onClose={() => {
          void vi.fn();
        }}
      />,
    );

    const importExportTab = screen.getByRole("button", {
      name: /import & export/i,
    });
    fireEvent.click(importExportTab);

    expect(screen.getByText("Import .ics (iCalendar) File")).toBeDefined();
    expect(screen.getByText("Export All Calendars")).toBeDefined();
  });
});
