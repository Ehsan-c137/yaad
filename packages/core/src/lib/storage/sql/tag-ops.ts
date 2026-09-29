import type { Tag } from "@yaad/core/types/document";

import type { DatabaseDriver } from "./schema";

export async function getTags(db: DatabaseDriver): Promise<Tag[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM tags ORDER BY updated_at ASC;",
    );
    return rows.map((row) => JSON.parse(row.json) as Tag);
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching tags:", error);
    return [];
  }
}

export async function saveTags(db: DatabaseDriver, tags: Tag[]): Promise<void> {
  try {
    const now = Date.now();

    await db.execute("DELETE FROM tags;");

    await Promise.all(
      tags.map((tag) =>
        db.execute(
          `INSERT INTO tags (id, name, color, created_at, updated_at, json)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [tag.id, tag.name, tag.color, now, now, JSON.stringify(tag)],
        ),
      ),
    );
  } catch (error) {
    console.error("[TauriSqlAdapter] Error saving tags:", error);
  }
}
