import type { Workspace } from "@yaad/core/types/workspace";

import type { DatabaseDriver } from "./schema";

export async function getWorkspaces(db: DatabaseDriver): Promise<Workspace[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM workspaces ORDER BY updated_at DESC;",
    );
    return rows.map((row) => JSON.parse(row.json) as Workspace);
  } catch (error) {
    console.error("[TauriSqlAdapter] Error fetching workspaces:", error);
    return [];
  }
}

export async function saveWorkspace(
  db: DatabaseDriver,
  workspace: Workspace,
): Promise<void> {
  try {
    await db.execute(
      `INSERT INTO workspaces (id, json, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT(id) DO UPDATE SET json = $2, updated_at = $3;`,
      [workspace.id, JSON.stringify(workspace), Date.now()],
    );
  } catch (error) {
    console.error("[TauriSqlAdapter] Error saving workspace:", error);
  }
}

export async function deleteWorkspace(
  db: DatabaseDriver,
  id: string,
): Promise<void> {
  try {
    await db.execute("DELETE FROM workspaces WHERE id = $1;", [id]);
    await db.execute("DELETE FROM workspace_trees WHERE workspace_id = $1;", [
      id,
    ]);
  } catch (error) {
    console.error("[TauriSqlAdapter] Error deleting workspace:", error);
  }
}
