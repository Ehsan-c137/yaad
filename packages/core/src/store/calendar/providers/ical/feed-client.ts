import type { CalendarCategoryId, CalendarEvent } from "../../types";

import { parseICS } from "../../ical-utils";

/**
 * Fetches an iCal / Webcal feed URL and parses into Yaad CalendarEvents
 */
export async function fetchICalFeed(
  feedUrl: string,
  targetCategory: CalendarCategoryId,
): Promise<CalendarEvent[]> {
  // Normalize webcal:// to https://
  let normalizedUrl = feedUrl.trim();

  if (normalizedUrl.startsWith("webcal://")) {
    normalizedUrl = `https://${normalizedUrl.slice(9)}`;
  } else if (normalizedUrl.startsWith("http://")) {
    normalizedUrl = `https://${normalizedUrl.slice(7)}`;
  }

  let icsText = "";

  try {
    const res = await fetch(normalizedUrl, {
      headers: { Accept: "text/calendar, text/plain, */*" },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    icsText = await res.text();
  } catch (err: unknown) {
    // If browser CORS blocked the direct request, try CORS proxy fallback
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
      const proxyRes = await fetch(proxyUrl);

      if (proxyRes.ok) {
        icsText = await proxyRes.text();
      } else {
        throw err;
      }
    } catch {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Failed to fetch iCal feed: ${message}. If CORS is restricted, consider downloading the .ics file and importing it directly.`,
      );
    }
  }

  if (!icsText?.includes("BEGIN:VCALENDAR")) {
    throw new Error(
      "Invalid iCal response: Content does not contain a valid VCALENDAR payload.",
    );
  }

  return parseICS(icsText, targetCategory, "ical");
}
