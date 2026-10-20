import type { CalendarCategoryId, CalendarEvent } from "../../types";

import { formatDateToISO } from "../../calendar-utils";

export interface GoogleCalendarItem {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  status?: string;
  conferenceData?: {
    entryPoints?: {
      entryPointType?: string;
      uri?: string;
      label?: string;
    }[];
  };
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export interface GoogleCalendarApiResponse {
  items?: GoogleCalendarItem[];
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Extracts account email from a Google Calendar iCal feed URL
 * e.g. https://calendar.google.com/calendar/ical/user%40gmail.com/private-.../basic.ics
 */
export function extractGoogleEmailFromFeedUrl(url: string): string | null {
  try {
    const match = /\/calendar\/ical\/([^/]+)\/(?:private|public)/i.exec(url);

    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // Ignore invalid URI components
  }

  return null;
}

/**
 * Checks if a URL is a Google Calendar iCal URL
 */
export function isGoogleCalendarUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes("calendar.google.com/calendar/ical/") ||
    trimmed.includes(".google.com/calendar/")
  );
}

/**
 * Maps Google Calendar API items to Yaad CalendarEvent objects
 */
export function mapGoogleItemToEvent(
  item: GoogleCalendarItem,
  calendarId: CalendarCategoryId,
): CalendarEvent {
  const isAllDay = !item.start?.dateTime && Boolean(item.start?.date);

  let dateStr = "";
  let startTime = "09:00";
  let endTime = "10:00";

  if (isAllDay && item.start?.date) {
    // Keep date string directly without UTC offset shifts
    dateStr = item.start.date;
    startTime = "00:00";
    endTime = "23:59";
  } else {
    const startRaw = item.start?.dateTime ?? new Date().toISOString();
    const startDate = new Date(startRaw);
    dateStr = formatDateToISO(startDate);
    startTime = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;

    if (item.end?.dateTime) {
      const endDate = new Date(item.end.dateTime);
      endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
    } else {
      const [sh, sm] = startTime.split(":").map(Number);
      const endHour = Math.min(23, sh + 1);
      endTime = `${String(endHour).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
    }
  }

  // Find Google Meet or video conference link
  let videoLink: string | undefined = item.hangoutLink;

  if (!videoLink && item.conferenceData?.entryPoints) {
    const videoEntry = item.conferenceData.entryPoints.find(
      (ep) => ep.entryPointType === "video",
    );
    videoLink = videoEntry?.uri;
  }

  let finalLocation = item.location;

  if (!finalLocation && videoLink) {
    finalLocation = videoLink;
  }

  return {
    id: `gcal-${item.id}`,
    title: item.summary?.trim() ?? "(No title)",
    calendarId,
    date: dateStr,
    startTime,
    endTime,
    location: finalLocation,
    description: item.description,
    sourceProvider: "google",
    externalId: item.id,
    externalUrl: item.htmlLink ?? videoLink ?? "https://calendar.google.com",
    readOnly: true,
  };
}

/**
 * Fetches events directly from Google Calendar v3 REST API
 */
// eslint-disable-next-line max-params
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId = "primary",
  targetCategory: CalendarCategoryId = "work",
  timeMin?: string,
  timeMax?: string,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const effectiveTimeMin =
    timeMin ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const effectiveTimeMax =
    timeMax ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  params.set("timeMin", effectiveTimeMin);
  params.set("timeMax", effectiveTimeMax);

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        "Google authentication token has expired or is invalid. Please sign in again.",
      );
    }
    if (res.status === 403) {
      throw new Error(
        "Access to Google Calendar was denied. Please verify your permissions or Google API quota.",
      );
    }
    if (res.status === 404) {
      throw new Error(
        `Google Calendar '${calendarId}' not found. Please verify the calendar ID.`,
      );
    }

    const errBody = (await res
      .json()
      .catch(() => null)) as GoogleCalendarApiResponse | null;
    throw new Error(
      errBody?.error?.message ??
        `Google Calendar API error (HTTP ${res.status})`,
    );
  }

  const data = (await res.json()) as GoogleCalendarApiResponse;
  const items = data.items ?? [];

  // Filter out cancelled events
  const activeItems = items.filter((item) => item.status !== "cancelled");

  return activeItems.map((item) => mapGoogleItemToEvent(item, targetCategory));
}

/**
 * Fetches user profile (email and name) using a Google OAuth access token
 */
export async function fetchGoogleUserProfile(
  accessToken: string,
): Promise<{ email?: string; name?: string; picture?: string }> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      return (await res.json()) as {
        email?: string;
        name?: string;
        picture?: string;
      };
    }
  } catch (err) {
    console.warn("[google-api-client] Failed to fetch Google profile:", err);
  }

  return {};
}
