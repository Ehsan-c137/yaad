import type {
  CalendarCategory,
  CalendarEvent,
} from "@yaad/core/store/calendar/types";

import type { DatabaseDriver } from "./schema";

export async function getCalendarEvents(
  db: DatabaseDriver,
): Promise<CalendarEvent[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM calendar_events ORDER BY updated_at ASC;",
    );
    return rows.map((r) => JSON.parse(r.json) as CalendarEvent);
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching calendar events:", error);
    return [];
  }
}

export async function saveCalendarEvent(
  db: DatabaseDriver,
  event: CalendarEvent,
): Promise<void> {
  try {
    await db.execute(
      `INSERT INTO calendar_events (id, json, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
      [event.id, JSON.stringify(event), Date.now()],
    );
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error saving calendar event ${event.id}:`,
      error,
    );
  }
}

export async function deleteCalendarEvent(
  db: DatabaseDriver,
  id: string,
): Promise<void> {
  try {
    await db.execute("DELETE FROM calendar_events WHERE id = $1;", [id]);
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error deleting calendar event ${id}:`,
      error,
    );
  }
}

export async function getCalendarCategories(
  db: DatabaseDriver,
): Promise<CalendarCategory[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM calendar_categories ORDER BY updated_at ASC;",
    );
    return rows.map((r) => JSON.parse(r.json) as CalendarCategory);
  } catch (error) {
    console.error(
      "[TauriSqlAdapter] Error fetching calendar categories:",
      error,
    );
    return [];
  }
}

export async function saveCalendarCategory(
  db: DatabaseDriver,
  category: CalendarCategory,
): Promise<void> {
  try {
    await db.execute(
      `INSERT INTO calendar_categories (id, json, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
      [category.id, JSON.stringify(category), Date.now()],
    );
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error saving calendar category ${category.id}:`,
      error,
    );
  }
}

export async function deleteCalendarCategory(
  db: DatabaseDriver,
  id: string,
): Promise<void> {
  try {
    await db.execute("DELETE FROM calendar_categories WHERE id = $1;", [id]);
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error deleting calendar category ${id}:`,
      error,
    );
  }
}
