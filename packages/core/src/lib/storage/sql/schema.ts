// ---------------------------------------------------------------------------
// Driver interface
// ---------------------------------------------------------------------------

export interface DatabaseDriver {
  execute: (
    query: string,
    bindValues?: unknown[],
  ) => Promise<{ rowsAffected: number }>;
  select: <T = unknown>(query: string, bindValues?: unknown[]) => Promise<T>;
}

// ---------------------------------------------------------------------------
// Schema DDL
// ---------------------------------------------------------------------------

export const DDL_WORKSPACES = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id         TEXT PRIMARY KEY,
    json       TEXT    NOT NULL,
    updated_at INTEGER
  );
`;

export const DDL_WORKSPACE_TREES = `
  CREATE TABLE IF NOT EXISTS workspace_trees (
    workspace_id TEXT PRIMARY KEY,
    json         TEXT    NOT NULL,
    updated_at   INTEGER
  );
`;

export const DDL_DOCUMENTS = `
  CREATE TABLE IF NOT EXISTS documents (
    id         TEXT PRIMARY KEY,
    json       TEXT    NOT NULL,
    updated_at INTEGER
  );
`;

export const DDL_BLOBS = `
  CREATE TABLE IF NOT EXISTS blobs (
    id         TEXT PRIMARY KEY,
    data       TEXT    NOT NULL,
    type       TEXT,
    updated_at INTEGER
  );
`;

export const DDL_BLOCK_TAGS = `
  CREATE TABLE IF NOT EXISTS block_tags (
    tag_id     TEXT    NOT NULL,
    page_id    TEXT    NOT NULL,
    block_id   TEXT    NOT NULL,
    block_type TEXT    NOT NULL,
    snippet    TEXT,
    updated_at INTEGER,
    PRIMARY KEY (tag_id, page_id, block_id)
  );
`;

export const DDL_TAGS = `
  CREATE TABLE IF NOT EXISTS tags (
    id         TEXT PRIMARY KEY,
    name       TEXT    NOT NULL,
    color      TEXT    NOT NULL,
    created_at INTEGER,
    updated_at INTEGER,
    json       TEXT    NOT NULL
  );
`;

export const DDL_IDX_BLOCK_TAGS_TAG_ID = `
  CREATE INDEX IF NOT EXISTS idx_block_tags_tag_id ON block_tags(tag_id);
`;

export const ALL_DDL = [
  DDL_WORKSPACES,
  DDL_WORKSPACE_TREES,
  DDL_DOCUMENTS,
  DDL_BLOBS,
  DDL_BLOCK_TAGS,
  DDL_TAGS,
  DDL_IDX_BLOCK_TAGS_TAG_ID,
] as const;
