import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { asc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import * as Y from 'yjs';

import type { Database } from '../../database/database.module.js';
import type { ICollabPersistence } from './interfaces/collab-persistence.interface.js';

import {
  documentCrdtUpdates,
  documents,
  pages,
} from '../../database/schema.js';

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
  ): Promise<any> {
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
    try {
      // Ensure page row exists so foreign key constraint is satisfied
      await this.db
        .insert(pages)
        .values({
          id: documentId,
          workspaceId,
          title: 'Untitled',
          version: 1,
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      const base64Data = Buffer.from(update).toString('base64');
      await this.db.insert(documentCrdtUpdates).values({
        id: randomUUID(),
        workspaceId,
        documentId,
        updateData: base64Data,
        createdAt: new Date(),
      });
    } catch (err: any) {
      this.logger.warn(
        `Failed to persist CRDT update for doc ${documentId} (may be uncommitted to pages table yet): ${err.message}`,
      );
    }
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

      const title = (metaMap.get('title') as string) || 'Untitled';
      const icon = (metaMap.get('icon') as string) || undefined;
      const coverImage =
        (metaMap.get('coverImage') as string) ||
        (metaMap.get('coverUrl') as string) ||
        undefined;
      const rootBlockId = (metaMap.get('rootBlockId') as string) || 'root';
      const version = (metaMap.get('version') as number) || 1;
      const createdAt = (metaMap.get('createdAt') as number) || Date.now();
      const updatedAt = Date.now();

      const rawRootArray = rootBlockIdsArray.toArray() as string[];
      const rootBlock = blocksObj[rootBlockId];

      if (
        rootBlock &&
        rawRootArray.length > 0 &&
        (!rootBlock.childrenIds || rootBlock.childrenIds.length === 0)
      ) {
        rootBlock.childrenIds = rawRootArray;
      }

      const materializedJson = {
        id: documentId,
        version,
        title,
        icon,
        coverImage,
        rootBlockId,
        rootBlockIds:
          rawRootArray.length > 0
            ? rawRootArray
            : (rootBlock?.childrenIds ?? []),
        blocks: blocksObj,
        createdAt,
        updatedAt,
      };

      // Ensure page row exists before inserting document snapshot
      await this.db
        .insert(pages)
        .values({
          id: documentId,
          workspaceId,
          title,
          icon: icon ?? null,
          version,
          updatedAt: new Date(updatedAt),
        })
        .onConflictDoUpdate({
          target: pages.id,
          set: {
            title,
            icon: icon ?? null,
            updatedAt: new Date(updatedAt),
          },
        });

      await this.db
        .insert(documents)
        .values({
          id: documentId,
          workspaceId,
          version,
          content: materializedJson as any,
          updatedAt: new Date(updatedAt),
        })
        .onConflictDoUpdate({
          target: documents.id,
          set: {
            content: materializedJson,
            updatedAt: new Date(updatedAt),
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
