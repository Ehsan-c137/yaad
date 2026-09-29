import type { WorkspacePageMeta } from "@yaad/core/types/workspace";

import type { DatabaseDriver } from "./schema";

export async function getWorkspaceTree(
  db: DatabaseDriver,
  workspaceId: string,
): Promise<WorkspacePageMeta[]> {
  try {
    const rows = await db.select<{ json: string }[]>(
      "SELECT json FROM workspace_trees WHERE workspace_id = $1;",
      [workspaceId],
    );
    if (rows.length === 0) return [];
    return JSON.parse(rows[0].json) as WorkspacePageMeta[];
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error loading tree for workspace ${workspaceId}:`,
      error,
    );
    return [];
  }
}

export async function saveWorkspaceTree(
  db: DatabaseDriver,
  workspaceId: string,
  tree: WorkspacePageMeta[],
): Promise<void> {
  try {
    await db.execute(
      `INSERT INTO workspace_trees (workspace_id, json, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT(workspace_id) DO UPDATE SET json = $2, updated_at = $3;`,
      [workspaceId, JSON.stringify(tree), Date.now()],
    );
  } catch (error) {
    console.error(
      `[TauriSqlAdapter] Error saving tree for workspace ${workspaceId}:`,
      error,
    );
  }
}
