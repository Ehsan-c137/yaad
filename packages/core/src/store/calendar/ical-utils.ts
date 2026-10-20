import type { CalendarCategoryId, CalendarEvent } from "./types";

/**
 * Unfolds folded lines per RFC 5545 specification.
 * Lines continuing with a space or tab are appended to the previous line.
 */
function unfoldICS(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalized.split("\n");
  const unfolded: string[] = [];

  for (const line of rawLines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.slice(1);
      }
    } else {
      unfolded.push(line);
    }
  }

  return unfolded;
}

/**
 * Unescapes RFC 5545 text escapes (\,, \;, \\, \n, \N)
 */
function unescapeICSText(str: string): string {
  return str
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/**
 * Escapes text for RFC 5545 property values
 */
function escapeICSText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Parses a date or datetime string from iCalendar into { date: "YYYY-MM-DD", time: "HH:mm" }
 */
function parseICSDateTime(valueStr: string): { date: string; time: string } {
  // Check for DATE format e.g. "20261018"
  const cleanVal = valueStr.trim();

  if (/^\d{8}$/.test(cleanVal)) {
    const y = cleanVal.slice(0, 4);
    const m = cleanVal.slice(4, 6);
    const d = cleanVal.slice(6, 8);
    return { date: `${y}-${m}-${d}`, time: "09:00" };
  }

  // Check for DATETIME format e.g. "20261018T143000Z" or "20261018T143000"
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(?:\d{2})?(Z)?/.exec(
    cleanVal,
  );

  if (match) {
    const [, y, m, d, hh, mm, isUTC] = match;

    if (isUTC) {
      // Convert UTC timestamp to local date and time
      const utcDate = new Date(
        Date.UTC(
          Number(y),
          Number(m) - 1,
          Number(d),
          Number(hh),
          Number(mm),
          0,
        ),
      );
      const localY = utcDate.getFullYear();
      const localM = String(utcDate.getMonth() + 1).padStart(2, "0");
      const localD = String(utcDate.getDate()).padStart(2, "0");
      const localH = String(utcDate.getHours()).padStart(2, "0");
      const localMin = String(utcDate.getMinutes()).padStart(2, "0");
      return {
        date: `${localY}-${localM}-${localD}`,
        time: `${localH}:${localMin}`,
      };
    }

    return {
      date: `${y}-${m}-${d}`,
      time: `${hh}:${mm}`,
    };
  }

  // Fallback
  return { date: new Date().toISOString().split("T")[0], time: "10:00" };
}

/**
 * Formats a local date and time string to an iCalendar UTC or local DATETIME representation
 */
function formatToICSDateTime(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dateObj = new Date(y, m - 1, d, hh, mm, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const utcYear = dateObj.getUTCFullYear();
  const utcMonth = pad(dateObj.getUTCMonth() + 1);
  const utcDay = pad(dateObj.getUTCDate());
  const utcHours = pad(dateObj.getUTCHours());
  const utcMinutes = pad(dateObj.getUTCMinutes());
  const utcSeconds = pad(dateObj.getUTCSeconds());

  return `${utcYear}${utcMonth}${utcDay}T${utcHours}${utcMinutes}${utcSeconds}Z`;
}

/**
 * Parses RFC 5545 iCalendar data into an array of Yaad CalendarEvent objects
 */
export function parseICS(
  icsData: string,
  targetCalendarId: CalendarCategoryId = "work",
  sourceProvider: CalendarEvent["sourceProvider"] = "ical",
): CalendarEvent[] {
  const lines = unfoldICS(icsData);
  const events: CalendarEvent[] = [];

  let inEvent = false;
  let currentEvent: Partial<CalendarEvent> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      currentEvent = {
        id: `ical-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        calendarId: targetCalendarId,
        sourceProvider,
        startTime: "09:00",
        endTime: "10:00",
      };
      continue;
    }

    if (trimmed === "END:VEVENT") {
      if (inEvent && currentEvent.title && currentEvent.date) {
        // Ensure endTime is valid
        if (
          !currentEvent.endTime ||
          currentEvent.endTime === currentEvent.startTime
        ) {
          const [h, m] = (currentEvent.startTime ?? "09:00")
            .split(":")
            .map(Number);
          currentEvent.endTime = `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }

        events.push(currentEvent as CalendarEvent);
      }

      inEvent = false;
      currentEvent = {};
      continue;
    }

    if (!inEvent) continue;

    // Split at first colon (or semicolon with parameters)
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const propertyKeyPart = trimmed.slice(0, colonIndex).toUpperCase();
    const propertyValue = trimmed.slice(colonIndex + 1);

    // Extract property name (before any parameters like DTSTART;TZID=...)
    const propertyName = propertyKeyPart.split(";")[0];

    switch (propertyName) {
      case "UID":
        currentEvent.externalId = propertyValue;
        currentEvent.id = `ext-${propertyValue.replace(/[^\w-]/g, "").slice(0, 32)}`;
        break;

      case "SUMMARY":
        currentEvent.title = unescapeICSText(propertyValue);
        break;

      case "DESCRIPTION":
        currentEvent.description = unescapeICSText(propertyValue);
        break;

      case "LOCATION":
        currentEvent.location = unescapeICSText(propertyValue);
        break;

      case "DTSTART": {
        const dt = parseICSDateTime(propertyValue);
        currentEvent.date = dt.date;
        currentEvent.startTime = dt.time;
        break;
      }

      case "DTEND": {
        const dt = parseICSDateTime(propertyValue);
        currentEvent.endTime = dt.time;

        // If date was not set by DTSTART, use DTEND's date
        if (!currentEvent.date) {
          currentEvent.date = dt.date;
        }

        break;
      }

      case "URL":
        currentEvent.externalUrl = propertyValue;
        break;
    }
  }

  return events;
}

/**
 * Serializes Yaad CalendarEvents into RFC 5545 iCalendar string
 */
export function generateICS(
  events: CalendarEvent[],
  calendarName = "Yaad Calendar",
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yaad PKM//Yaad Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICSText(calendarName)}`,
    `X-WR-TIMEZONE:UTC`,
  ];

  const nowUTC = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

  for (const event of events) {
    const uid = event.externalId ?? `${event.id}@yaad.local`;
    const dtStart = formatToICSDateTime(event.date, event.startTime);
    const dtEnd = formatToICSDateTime(event.date, event.endTime);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowUTC}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeICSText(event.location)}`);
    }
    if (event.externalUrl) {
      lines.push(`URL:${event.externalUrl}`);
    }

    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
