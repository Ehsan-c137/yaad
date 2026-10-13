import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { asc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import * as Y from 'yjs';
import type { Database } from '../../database/database.module.js';
import { documentCrdtUpdates, documents } from '../../database/schema.js';
import type { ICollabPersistence } from './interfaces/collab-persistence.interface.js';

@Injectable()
export class CollabPersistenceService implements ICollabPersistence {
  private readonly logger = new Logger(CollabPersistenceService.name);

  constructor(@InjectDrizzle() private readonly db: Database) {}

  /**
   * Loads all stored CRDT binary updates for a document.
   */
  async loadUpdates(
    workspaceId: string,
    documentId: string,
  ): Promise<Uint8Array[]> {
    const rows = await this.db
      .select({ updateData: documentCrdtUpdates.updateData })
      .from(documentCrdtUpdates)
      .where(eq(documentCrdtUpdates.documentId, documentId))
      .orderBy(asc(documentCrdtUpdates.createdAt));

    return rows.map((row) => Buffer.from(row.updateData, 'base64'));
  }

  /**
   * Loads the existing baseline JSON document if available.
   */
  async loadBaselineJson(
    workspaceId: string,
    documentId: string,
  ): Promise<any | null> {
    const [doc] = await this.db
      .select({ content: documents.content })
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    return doc?.content ?? null;
  }

  /**
   * Persists an incremental binary update to the database.
   */
  async appendUpdate(
    workspaceId: string,
    documentId: string,
    update: Uint8Array,
  ): Promise<void> {
    const base64Data = Buffer.from(update).toString('base64');
    await this.db.insert(documentCrdtUpdates).values({
      id: randomUUID(),
      workspaceId,
      documentId,
      updateData: base64Data,
      createdAt: new Date(),
    });
  }

  /**
   * Materializes the in-memory Y.Doc state into canonical DocumentJSON
   * and saves it in the documents table for fast querying & search.
   */
  async materializeSnapshot(
    workspaceId: string,
    documentId: string,
    ydoc: Y.Doc,
  ): Promise<void> {
    try {
      const metaMap = ydoc.getMap('meta');
      const blocksMap = ydoc.getMap('blocks');
      const rootBlockIdsArray = ydoc.getArray('rootBlockIds');

      const blocksObj: Record<string, any> = {};
      blocksMap.forEach((blockMap: any, key: string) => {
        if (typeof blockMap?.toJSON === 'function') {
          blocksObj[key] = blockMap.toJSON();
        } else {
          blocksObj[key] = blockMap;
        }
      });

      const materializedJson = {
        id: documentId,
        title: metaMap.get('title') ?? 'Untitled',
        icon: metaMap.get('icon') ?? null,
        coverUrl: metaMap.get('coverUrl') ?? null,
        rootBlockIds: rootBlockIdsArray.toArray() as string[],
        blocks: blocksObj,
        updatedAt: Date.now(),
      };

      await this.db
        .insert(documents)
        .values({
          id: documentId,
          workspaceId,
          version: 1,
          content: materializedJson as any,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: documents.id,
          set: {
            content: materializedJson as any,
            updatedAt: new Date(),
          },
        });

      this.logger.debug(
        `Materialized snapshot for doc ${documentId} in workspace ${workspaceId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to materialize snapshot for doc ${documentId}:`,
        err,
      );
    }
  }
}
