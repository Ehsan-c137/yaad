import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../../../database/schema.js';
import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';

export type DbTransaction = Parameters<
  Parameters<NodePgDatabase<typeof schema>['transaction']>[0]
>[0];

export interface MutationHandler {
  readonly entityType: SyncEntityType;
  apply: (
    tx: DbTransaction,
    mutation: SyncMutationDto,
    version: number,
    workspaceId: string,
  ) => Promise<void>;
}
