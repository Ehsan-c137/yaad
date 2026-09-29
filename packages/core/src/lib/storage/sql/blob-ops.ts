import type { DatabaseDriver } from "./schema";

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType || "" });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binaryString = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }

  return btoa(binaryString);
}

export async function getBlob(
  db: DatabaseDriver,
  id: string,
): Promise<Blob | undefined> {
  try {
    const rows = await db.select<{ data: string; type: string }[]>(
      "SELECT data, type FROM blobs WHERE id = $1;",
      [id],
    );
    if (rows.length === 0) return undefined;
    return base64ToBlob(rows[0].data, rows[0].type);
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error loading blob ${id}:`, error);
    return undefined;
  }
}

export async function saveBlob(
  db: DatabaseDriver,
  id: string,
  blob: Blob,
): Promise<void> {
  try {
    const base64Data = await blobToBase64(blob);
    await db.execute(
      `INSERT INTO blobs (id, data, type, updated_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT(id) DO UPDATE SET data = $2, type = $3, updated_at = $4;`,
      [id, base64Data, blob.type || "", Date.now()],
    );
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error saving blob ${id}:`, error);
  }
}

export async function removeBlob(
  db: DatabaseDriver,
  id: string,
): Promise<void> {
  try {
    await db.execute("DELETE FROM blobs WHERE id = $1;", [id]);
  } catch (error) {
    console.error(`[TauriSqlAdapter] Error removing blob ${id}:`, error);
  }
}

export async function getAllBlobs(
  db: DatabaseDriver,
): Promise<{ id: string; blob: Blob }[]> {
  try {
    const rows = await db.select<{ id: string; data: string; type: string }[]>(
      "SELECT id, data, type FROM blobs;",
    );
    return rows.map((row) => ({
      id: row.id,
      blob: base64ToBlob(row.data, row.type),
    }));
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching all blobs:", error);
    return [];
  }
}
