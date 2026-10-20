import type {
  CalendarProviderConnection,
  CalendarProviderType,
} from "../types";
import type {
  CalendarSyncHandler,
  ProviderHandlerMap,
  SyncResult,
} from "./provider-types";

import { syncGoogleCalendar } from "./google/google-sync-provider";
import { syncICalCalendar } from "./ical/ical-sync-provider";

/**
 * Default dispatch dictionary mapping provider types to their sync handlers.
 */
export const defaultProviderHandlers: ProviderHandlerMap = {
  google: syncGoogleCalendar,
  ical_url: syncICalCalendar,
};

/**
 * Functional registry for managing and extending calendar provider sync handlers.
 */
export function createProviderRegistry(
  initialHandlers: ProviderHandlerMap = defaultProviderHandlers,
) {
  const handlers: ProviderHandlerMap = { ...initialHandlers };

  return {
    register(type: CalendarProviderType, handler: CalendarSyncHandler) {
      handlers[type] = handler;
    },
    unregister(type: CalendarProviderType) {
      Reflect.deleteProperty(handlers, type);
    },
    get(type: CalendarProviderType): CalendarSyncHandler | undefined {
      return handlers[type];
    },
    has(type: CalendarProviderType): boolean {
      return Boolean(handlers[type]);
    },
    sync(connection: CalendarProviderConnection): Promise<SyncResult> {
      return syncWithHandlers(connection, handlers);
    },
    getHandlers(): Readonly<ProviderHandlerMap> {
      return handlers;
    },
  };
}

export type ProviderRegistry = ReturnType<typeof createProviderRegistry>;

/**
 * Shared default registry instance.
 */
export const defaultProviderRegistry = createProviderRegistry();

/**
 * Pure functional dispatcher that executes the matching provider sync handler.
 */
export async function syncWithHandlers(
  connection: CalendarProviderConnection,
  handlers: ProviderHandlerMap = defaultProviderHandlers,
): Promise<SyncResult> {
  const handler = handlers[connection.provider];

  if (!handler) {
    return {
      events: [],
      error: `Unsupported provider: ${connection.provider}`,
    };
  }

  try {
    const events = await handler(connection);
    return { events };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { events: [], error: message };
  }
}
