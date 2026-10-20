import type {
  CalendarEvent,
  CalendarProviderConnection,
  CalendarProviderType,
} from "../types";

export interface SyncResult {
  events: CalendarEvent[];
  error?: string;
}

/**
 * Functional calendar synchronization handler.
 * Takes a provider connection and returns an array of calendar events.
 */
export type CalendarSyncHandler = (
  connection: CalendarProviderConnection,
) => Promise<CalendarEvent[]>;

/**
 * Functional mapping table of provider sync handlers.
 */
export type ProviderHandlerMap = Partial<
  Record<CalendarProviderType, CalendarSyncHandler>
>;
