import type { DocumentJSON } from "@yaad/core/types/document";

import type { DatabaseDriver } from "./schema";

export async function getDocument(
  db: DatabaseDriver,
  id: string,
): Promise<DocumentJSON | null> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM documents WHERE id = $1;",
      [id],
    );
    if (rows.length === 0) return null;
    return JSON.parse(rows[0].json) as DocumentJSON;
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error loading document ${id}:`, error);
    return null;
  }
}

export async function saveDocument(
  db: DatabaseDriver,
  doc: DocumentJSON,
): Promise<void> {
  try {
    await db.execute(
      `INSERT INTO documents (id, json, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
      [doc.id, JSON.stringify(doc), Date.now()],
    );
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error saving document ${doc.id}:`, error);
  }
}

export async function deleteDocument(
  db: DatabaseDriver,
  id: string,
  deleteDocTagsFn: (pageId: string) => Promise<void>,
): Promise<void> {
  try {
    await db.execute("DELETE FROM documents WHERE id = $1;", [id]);
    await deleteDocTagsFn(id);
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error deleting document ${id}:`, error);
  }
}

export async function getAllDocuments(
  db: DatabaseDriver,
): Promise<DocumentJSON[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM documents ORDER BY updated_at DESC;",
    );
    return rows.map((r) => JSON.parse(r.json) as DocumentJSON);
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching all documents:", error);
    return [];
  }
}
