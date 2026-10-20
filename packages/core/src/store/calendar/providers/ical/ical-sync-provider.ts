import type { CalendarEvent, CalendarProviderConnection } from "../../types";

import { fetchICalFeed } from "./feed-client";

/**
 * Functional sync handler for generic iCal / Webcal subscriptions.
 */
export async function syncICalCalendar(
  connection: CalendarProviderConnection,
): Promise<CalendarEvent[]> {
  if (!connection.feedUrl) {
    throw new Error("Missing feed URL for iCal connection.");
  }

  return fetchICalFeed(connection.feedUrl, connection.calendarId);
}
