import type { DocumentBlockType } from "@yaad/core/types/document";

import type { TagIndexRecord } from "../types";
import type { DatabaseDriver } from "./schema";

interface BlockTagRow {
  tag_id: string;
  page_id: string;
  block_id: string;
  block_type: DocumentBlockType;
  snippet: string;
  updated_at: number;
}

export async function saveDocTags(
  db: DatabaseDriver,
  pageId: string,
  records: TagIndexRecord[],
): Promise<void> {
  try {
    await db.execute("DELETE FROM block_tags WHERE page_id = $1;", [pageId]);

    await Promise.all(
      records.map((record) =>
        db.execute(
          `INSERT INTO block_tags (tag_id, page_id, block_id, block_type, snippet, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT(tag_id, page_id, block_id) DO UPDATE SET snippet = $5, updated_at = $6;`,
          [
            record.tagId,
            record.pageId,
            record.blockId,
            record.blockType,
            record.snippet ?? "",
            record.updatedAt,
          ],
        ),
      ),
    );
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error saving tag index for page ${pageId}:`,
      error,
    );
  }
}

export async function deleteDocTags(
  db: DatabaseDriver,
  pageId: string,
): Promise<void> {
  try {
    await db.execute("DELETE FROM block_tags WHERE page_id = $1;", [pageId]);
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error deleting tag index for page ${pageId}:`,
      error,
    );
  }
}

export async function getTagsIndex(
  db: DatabaseDriver,
  tagId?: string,
): Promise<TagIndexRecord[]> {
  try {
    const params: unknown[] = [];
    let query =
      "SELECT tag_id, page_id, block_id, block_type, snippet, updated_at FROM block_tags";

    if (tagId) {
      query += " WHERE tag_id = $1";
      params.push(tagId);
    }

    query += " ORDER BY updated_at DESC;";

    const rows = await db.select<BlockTagRow[]>(query, params);

    return rows.map((row) => ({
      tagId: row.tag_id,
      pageId: row.page_id,
      blockId: row.block_id,
      blockType: row.block_type,
      snippet: row.snippet,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching tag index:", error);
    return [];
  }
}
