import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, asc, eq, gt } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../database/database.module.js';
import { syncLog, workspaces } from '../../database/schema.js';
import type {
  PullResultDto,
  PullSyncDto,
  PushResultDto,
  PushSyncDto,
  SyncMutationDto,
} from './dto/sync.dto.js';
import type { DbTransaction } from './handlers/mutation-handler.interface.js';
import { SyncHandlerRegistry } from './handlers/sync-handler.registry.js';

@Injectable()
export class SyncService {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly handlerRegistry: SyncHandlerRegistry,
  ) {}

  /**
   * Applies a batch of local mutations atomically and appends them to the sync log.
   */
  async push(dto: PushSyncDto): Promise<PushResultDto> {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, dto.workspaceId))
      .limit(1);

    if (!workspace) {
      throw new NotFoundException(`Workspace ${dto.workspaceId} not found`);
    }

    const acceptedMutationIds: string[] = [];

    const finalVersion = await this.db.transaction(async (tx) => {
      let nextVersion = workspace.currentVersion;

      for (const mut of dto.mutations) {
        // 1. Idempotency guard: skip mutations that were already processed
        if (mut.clientMutationId) {
          const isProcessed = await this.isMutationProcessed(
            tx,
            mut.clientMutationId,
          );
          if (isProcessed) {
            acceptedMutationIds.push(mut.clientMutationId);
            continue;
          }
        }

        nextVersion += 1;

        // 2. Delegate entity persistence to the corresponding strategy handler (OCP)
        const handler = this.handlerRegistry.get(mut.entityType);
        await handler.apply(tx, mut, nextVersion, dto.workspaceId);

        // 3. Append to the immutable sync log
        await this.appendSyncLog(tx, mut, nextVersion, dto.workspaceId);

        acceptedMutationIds.push(mut.clientMutationId);
      }

      // 4. Atomically update workspace currentVersion if mutations were applied
      if (nextVersion !== workspace.currentVersion) {
        await tx
          .update(workspaces)
          .set({
            currentVersion: nextVersion,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.id, dto.workspaceId));
      }

      return nextVersion;
    });

    return {
      acceptedMutationIds,
      lastServerVersion: finalVersion,
    };
  }

  /**
   * Retrieves all delta changes since the client's last known version checkpoint.
   */
  async pull(dto: PullSyncDto): Promise<PullResultDto> {
    const [workspace] = await this.db
      .select({ currentVersion: workspaces.currentVersion })
      .from(workspaces)
      .where(eq(workspaces.id, dto.workspaceId))
      .limit(1);

    if (!workspace) {
      throw new NotFoundException(`Workspace ${dto.workspaceId} not found`);
    }

    const limit = Math.min(dto.limit ?? 500, 1000);

    const changes = await this.db
      .select()
      .from(syncLog)
      .where(
        and(
          eq(syncLog.workspaceId, dto.workspaceId),
          gt(syncLog.version, dto.sinceVersion),
        ),
      )
      .orderBy(asc(syncLog.version))
      .limit(limit);

    const latestVersion = workspace.currentVersion;
    const lastVersionInBatch =
      changes.length > 0 ? changes[changes.length - 1].version : dto.sinceVersion;

    return {
      changes,
      latestVersion,
      hasMore: lastVersionInBatch < latestVersion,
    };
  }

  /**
   * Checks whether a client mutation was already processed.
   */
  private async isMutationProcessed(
    tx: DbTransaction,
    clientMutationId: string,
  ): Promise<boolean> {
    const [alreadyProcessed] = await tx
      .select({ id: syncLog.id })
      .from(syncLog)
      .where(eq(syncLog.clientMutationId, clientMutationId))
      .limit(1);

    return Boolean(alreadyProcessed);
  }

  /**
   * Appends a mutation entry into the immutable append-only change log.
   */
  private async appendSyncLog(
    tx: DbTransaction,
    mut: SyncMutationDto,
    version: number,
    workspaceId: string,
  ): Promise<void> {
    const logId = `log_${randomUUID()}`;
    await tx.insert(syncLog).values({
      id: logId,
      workspaceId,
      version,
      entityType: mut.entityType,
      entityId: mut.entityId,
      operation: mut.operation,
      patch: mut.payload,
      clientMutationId: mut.clientMutationId,
    });
  }
}
