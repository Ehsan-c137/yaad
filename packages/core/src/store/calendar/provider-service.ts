import type {
  ProviderHandlerMap,
  SyncResult,
} from "./providers/provider-types";
import type { CalendarProviderConnection } from "./types";

import {
  defaultProviderHandlers,
  syncWithHandlers,
} from "./providers/provider-registry";

export * from "./providers/google/google-api-client";
export * from "./providers/google/google-oauth-client";
export * from "./providers/google/google-sync-provider";
export * from "./providers/ical/feed-client";
export * from "./providers/ical/ical-sync-provider";
export * from "./providers/provider-registry";
// Export provider abstractions and functional handlers
export type * from "./providers/provider-types";

/**
 * Unified functional provider sync runner.
 * Dispatches synchronization to the registered handler for the given connection.
 */
export async function syncProvider(
  connection: CalendarProviderConnection,
  handlers: ProviderHandlerMap = defaultProviderHandlers,
): Promise<SyncResult> {
  return syncWithHandlers(connection, handlers);
}
