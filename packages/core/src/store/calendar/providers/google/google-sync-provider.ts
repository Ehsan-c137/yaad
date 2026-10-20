import type { CalendarEvent, CalendarProviderConnection } from "../../types";

import { fetchICalFeed } from "../ical/feed-client";
import { fetchGoogleCalendarEvents } from "./google-api-client";

/**
 * Functional sync handler for Google Calendar.
 * Supports direct Google Calendar API v3 via OAuth access token
 * or private Google Calendar Secret Address feeds.
 */
export async function syncGoogleCalendar(
  connection: CalendarProviderConnection,
): Promise<CalendarEvent[]> {
  // 1. Direct REST API v3 using OAuth access token
  if (connection.accessToken) {
    return fetchGoogleCalendarEvents(
      connection.accessToken,
      "primary",
      connection.calendarId,
    );
  }

  // 2. Google Calendar Secret Address or public iCal feed
  if (connection.feedUrl) {
    const events = await fetchICalFeed(
      connection.feedUrl,
      connection.calendarId,
    );
    return events.map((e) => ({
      ...e,
      sourceProvider: "google",
    }));
  }

  throw new Error(
    "Google Calendar connection requires an active OAuth authorization or Calendar Secret Address.",
  );
}
