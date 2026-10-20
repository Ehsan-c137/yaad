import { describe, expect, it, vi } from "vitest";

import type { CalendarEvent, CalendarProviderConnection } from "../types";

import {
  formatDateToISO,
  formatMonthLabel,
  formatWeekLabel,
  getCurrentTime,
  getWeekDays,
  isSameDay,
  parseISODate,
} from "../calendar-utils";
import { generateICS, parseICS } from "../ical-utils";
import {
  createProviderRegistry,
  defaultProviderHandlers,
  extractGoogleEmailFromFeedUrl,
  fetchGoogleCalendarEvents,
  isGoogleCalendarUrl,
  mapGoogleItemToEvent,
  syncProvider,
  syncWithHandlers,
} from "../provider-service";
import { useCalendarStore } from "../use-calendar-store";

describe("Calendar Utilities", () => {
  it("formats dates to ISO strings correctly", () => {
    const d = new Date(2026, 9, 18);
    expect(formatDateToISO(d)).toBe("2026-10-18");
  });

  it("parses ISO date strings accurately", () => {
    const d = parseISODate("2026-10-18");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(18);
  });

  it("gets current time object with label", () => {
    const ct = getCurrentTime();
    expect(ct.hours).toBeGreaterThanOrEqual(0);
    expect(ct.hours).toBeLessThanOrEqual(23);
    expect(ct.minutes).toBeGreaterThanOrEqual(0);
    expect(ct.minutes).toBeLessThanOrEqual(59);
    expect(ct.label).toMatch(/^\d{2}:\d{2}$/);
  });

  it("computes 7 days of the week starting on Monday", () => {
    const date = new Date(2026, 9, 14); // Wednesday
    const week = getWeekDays(date, "2026-10-14");
    expect(week).toHaveLength(7);
    expect(week[0].name).toBe("Mon");
    expect(week[0].dateStr).toBe("2026-10-12");
    expect(week[2].name).toBe("Wed");
    expect(week[2].isToday).toBe(true);
    expect(week[6].name).toBe("Sun");
    expect(week[6].dateStr).toBe("2026-10-18");
  });

  it("formats week label within same month", () => {
    const date = parseISODate("2026-10-14");
    const week = getWeekDays(date, "2026-10-14");
    const label = formatWeekLabel(date, week);
    expect(label).toBe("Week 42 · Oct 12 – 18");
  });

  it("formats week label spanning across two months", () => {
    const date = parseISODate("2026-10-29");
    const week = getWeekDays(date, "2026-10-29");
    const label = formatWeekLabel(date, week);
    expect(label).toBe("Week 44 · Oct 26 – Nov 1");
  });

  it("formats month label", () => {
    const date = parseISODate("2026-10-14");
    expect(formatMonthLabel(date)).toBe("October 2026");
  });

  it("checks same day correctly for strings and dates", () => {
    expect(isSameDay("2026-10-14", "2026-10-14")).toBe(true);
    expect(isSameDay("2026-10-14", "2026-10-15")).toBe(false);
    expect(isSameDay(parseISODate("2026-10-14"), "2026-10-14")).toBe(true);
  });

  it("handles month transition edge cases without overflow", () => {
    const store = useCalendarStore.getState();
    store.setViewMode("month");

    // March 31 - 1 month should clamp to February 28
    store.setCurrentDate("2026-03-31");
    store.goToPrev();
    expect(useCalendarStore.getState().currentDateStr).toBe("2026-02-28");

    // January 31 + 1 month should clamp to February 28
    store.setCurrentDate("2026-01-31");
    store.goToNext();
    expect(useCalendarStore.getState().currentDateStr).toBe("2026-02-28");
  });
});

describe("iCalendar (RFC 5545) Parser and Generator", () => {
  const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:evt-123456
SUMMARY:Sprint Planning Meeting
DESCRIPTION:Bi-weekly sprint planning and OKR check\\, team roadmap
LOCATION:Google Meet (meet.google.com/xyz)
DTSTART:20261019T093000Z
DTEND:20261019T103000Z
URL:https://calendar.google.com/event?eid=123
END:VEVENT
END:VCALENDAR`;

  it("parses valid ICS content into CalendarEvent objects", () => {
    const events = parseICS(sampleICS, "work", "google");
    expect(events).toHaveLength(1);

    const evt = events[0];
    expect(evt.title).toBe("Sprint Planning Meeting");
    expect(evt.description).toContain("team roadmap");
    expect(evt.location).toContain("Google Meet");
    expect(evt.sourceProvider).toBe("google");
    expect(evt.externalId).toBe("evt-123456");
  });

  it("generates valid RFC 5545 ICS string from CalendarEvents", () => {
    const events: CalendarEvent[] = [
      {
        id: "evt-test-1",
        title: "Architecture Review",
        calendarId: "work",
        date: "2026-10-20",
        startTime: "14:00",
        endTime: "15:00",
        location: "Studio 1",
        description: "Review modular calendar interfaces",
      },
    ];

    const icsString = generateICS(events, "Yaad Test Calendar");
    expect(icsString).toContain("BEGIN:VCALENDAR");
    expect(icsString).toContain("SUMMARY:Architecture Review");
    expect(icsString).toContain("LOCATION:Studio 1");
    expect(icsString).toContain("END:VEVENT");
    expect(icsString).toContain("END:VCALENDAR");
  });
});

describe("Google Calendar Integration & Provider Service", () => {
  it("maps Google Calendar API v3 items to Yaad CalendarEvent objects", () => {
    const gItem = {
      id: "gcal-event-99",
      summary: "Quarterly Review",
      description: "Leadership presentation",
      location: "San Francisco / Virtual",
      htmlLink: "https://calendar.google.com/event?eid=99",
      start: {
        dateTime: "2026-10-21T11:00:00Z",
      },
      end: {
        dateTime: "2026-10-21T12:00:00Z",
      },
    };

    const evt = mapGoogleItemToEvent(gItem, "work");
    expect(evt.title).toBe("Quarterly Review");
    expect(evt.sourceProvider).toBe("google");
    expect(evt.externalId).toBe("gcal-event-99");
    expect(evt.externalUrl).toBe("https://calendar.google.com/event?eid=99");
    expect(evt.readOnly).toBe(true);
  });

  it("extracts account email correctly from Google Calendar secret and public iCal URLs", () => {
    const secretUrl =
      "https://calendar.google.com/calendar/ical/alex.turner%40gmail.com/private-65a88c3de75f0a/basic.ics";
    expect(extractGoogleEmailFromFeedUrl(secretUrl)).toBe(
      "alex.turner@gmail.com",
    );

    const publicUrl =
      "https://calendar.google.com/calendar/ical/team%40company.com/public/basic.ics";
    expect(extractGoogleEmailFromFeedUrl(publicUrl)).toBe("team@company.com");

    const nonGoogle = "https://example.com/calendar.ics";
    expect(extractGoogleEmailFromFeedUrl(nonGoogle)).toBeNull();
  });

  it("validates Google Calendar URLs accurately", () => {
    expect(
      isGoogleCalendarUrl(
        "https://calendar.google.com/calendar/ical/user%40gmail.com/private-123/basic.ics",
      ),
    ).toBe(true);
    expect(
      isGoogleCalendarUrl(
        "webcal://calendar.google.com/calendar/ical/user/public/basic.ics",
      ),
    ).toBe(true);
    expect(isGoogleCalendarUrl("https://outlook.live.com/owa/calendar")).toBe(
      false,
    );
  });

  it("handles all-day events and Google Meet links in mapGoogleItemToEvent", () => {
    const allDayItem = {
      id: "all-day-1",
      summary: "Company Retreat",
      hangoutLink: "https://meet.google.com/xyz-uvwx-rst",
      start: {
        date: "2026-10-25",
      },
      end: {
        date: "2026-10-26",
      },
    };

    const evt = mapGoogleItemToEvent(allDayItem, "work");
    expect(evt.date).toBe("2026-10-25");
    expect(evt.startTime).toBe("00:00");
    expect(evt.endTime).toBe("23:59");
    expect(evt.location).toBe("https://meet.google.com/xyz-uvwx-rst");
    expect(evt.sourceProvider).toBe("google");
  });

  it("fetches events from Google Calendar API v3 and filters cancelled events", async () => {
    const mockApiResponse = {
      items: [
        {
          id: "active-1",
          summary: "Sprint Kickoff",
          start: { dateTime: "2026-10-21T09:00:00Z" },
          end: { dateTime: "2026-10-21T10:00:00Z" },
          status: "confirmed",
        },
        {
          id: "cancelled-1",
          summary: "Old Meeting",
          start: { dateTime: "2026-10-21T11:00:00Z" },
          end: { dateTime: "2026-10-21T12:00:00Z" },
          status: "cancelled",
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockApiResponse),
    } as unknown as Response);

    try {
      const events = await fetchGoogleCalendarEvents(
        "mock-valid-token",
        "primary",
        "work",
      );
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe("Sprint Kickoff");
      expect(events[0].id).toBe("gcal-active-1");
      expect(events[0].sourceProvider).toBe("google");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("syncs Google Calendar using Secret Address feedUrl", async () => {
    const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
UID:google-secret-evt-1
SUMMARY:Live Sync Meeting
DESCRIPTION:Synced via Secret Address
LOCATION:Google Meet (meet.google.com/test-room)
DTSTART:20261022T140000Z
DTEND:20261022T150000Z
URL:https://calendar.google.com/event?eid=sec123
END:VEVENT
END:VCALENDAR`;

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(sampleICS),
    } as unknown as Response);

    try {
      const connection: CalendarProviderConnection = {
        id: "prov-secret-test",
        provider: "google",
        name: "Google Calendar",
        feedUrl:
          "https://calendar.google.com/calendar/ical/test%40gmail.com/private-abc/basic.ics",
        color: "#3b82f6",
        calendarId: "cat-google-secret",
        syncStatus: "idle",
        autoSync: true,
      };

      const result = await syncProvider(connection);
      expect(result.error).toBeUndefined();
      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe("Live Sync Meeting");
      expect(result.events[0].sourceProvider).toBe("google");
      expect(result.events[0].location).toContain("meet.google.com");
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("Calendar Store Provider Integration", () => {
  it("manages calendar providers and syncs events", async () => {
    const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
UID:live-evt-99
SUMMARY:Product Planning Sync
LOCATION:Google Meet
DTSTART:20261022T140000Z
DTEND:20261022T150000Z
END:VEVENT
END:VCALENDAR`;

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(sampleICS),
    } as unknown as Response);

    try {
      const store = useCalendarStore.getState();

      const provider: CalendarProviderConnection = {
        id: "prov-test-google",
        provider: "google",
        name: "Google (Work)",
        feedUrl:
          "https://calendar.google.com/calendar/ical/developer%40gmail.com/private-token/basic.ics",
        accountEmail: "developer@gmail.com",
        color: "#3b82f6",
        calendarId: "cat-google-work",
        syncStatus: "idle",
        autoSync: true,
      };

      // Add provider
      store.addProvider(provider);
      let state = useCalendarStore.getState();
      expect(state.providers.find((p) => p.id === provider.id)).toBeDefined();

      // Check that corresponding category was automatically created
      const cat = state.categories.find((c) => c.id === provider.calendarId);
      expect(cat).toBeDefined();
      expect(cat?.name).toBe("Google (Work)");

      // Sync provider
      await store.syncProviderConnection(provider.id);
      state = useCalendarStore.getState();
      const syncedProvider = state.providers.find((p) => p.id === provider.id);
      expect(syncedProvider?.syncStatus).toBe("success");
      expect(syncedProvider?.lastSyncedAt).toBeDefined();

      // Verify events were imported into this category
      const providerEvents = state.events.filter(
        (e) => e.calendarId === provider.calendarId,
      );
      expect(providerEvents.length).toBeGreaterThan(0);
      expect(providerEvents[0].sourceProvider).toBe("google");
      expect(providerEvents[0].title).toBe("Product Planning Sync");

      // Remove provider
      store.removeProvider(provider.id);
      state = useCalendarStore.getState();
      expect(state.providers.find((p) => p.id === provider.id)).toBeUndefined();
      expect(
        state.categories.find((c) => c.id === provider.calendarId),
      ).toBeUndefined();
      expect(
        state.events.filter((e) => e.calendarId === provider.calendarId),
      ).toHaveLength(0);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("Functional Calendar Provider Dispatcher & Registry", () => {
  it("executes registered functional handlers and supports custom extensions", async () => {
    const customHandlers = {
      ...defaultProviderHandlers,
      outlook: (conn: CalendarProviderConnection) =>
        Promise.resolve([
          {
            id: "outlook-evt-1",
            title: "Outlook Sync Meeting",
            calendarId: conn.calendarId,
            date: "2026-10-25",
            startTime: "10:00",
            endTime: "11:00",
            sourceProvider: "outlook" as const,
          },
        ]),
    };

    const connection: CalendarProviderConnection = {
      id: "prov-outlook-1",
      provider: "outlook",
      name: "Work Outlook",
      color: "#0078d4",
      calendarId: "cat-outlook-1",
      syncStatus: "idle",
      autoSync: true,
    };

    const result = await syncWithHandlers(connection, customHandlers);
    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("Outlook Sync Meeting");

    const unsupported = await syncWithHandlers(
      connection,
      defaultProviderHandlers,
    );
    expect(unsupported.error).toContain("Unsupported provider");
  });

  it("creates extensible functional registries", async () => {
    const registry = createProviderRegistry();
    expect(registry.has("google")).toBe(true);
    expect(registry.has("outlook")).toBe(false);

    registry.register("outlook", async (conn) =>
      Promise.resolve([
        {
          id: "reg-evt-1",
          title: "Dynamic Meeting",
          calendarId: conn.calendarId,
          date: "2026-10-25",
          startTime: "09:00",
          endTime: "10:00",
          sourceProvider: "outlook",
        },
      ]),
    );
    expect(registry.has("outlook")).toBe(true);

    const conn: CalendarProviderConnection = {
      id: "dyn-1",
      provider: "outlook",
      name: "Outlook",
      color: "#0078d4",
      calendarId: "cat-dyn-1",
      syncStatus: "idle",
      autoSync: true,
    };

    const res = await registry.sync(conn);
    expect(res.events).toHaveLength(1);
    expect(res.events[0].title).toBe("Dynamic Meeting");

    registry.unregister("outlook");
    expect(registry.has("outlook")).toBe(false);
  });
});
