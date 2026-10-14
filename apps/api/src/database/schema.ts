import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  jsonb,
  text,
  bigint,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { DocumentJSON } from '@yaad/core/types/document.js';
import type { WorkspacePageMeta } from '@yaad/core/types/workspace.js';

// --- Users & Auth ---
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Workspaces ---
export const workspaces = pgTable('workspaces', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: varchar('owner_id', { length: 64 }).references(() => users.id).notNull(),
  currentVersion: bigint('current_version', { mode: 'number' }).default(0).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Workspace Members (Multi-device / Collaboration) ---
export const workspaceMembers = pgTable('workspace_members', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 })
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: varchar('user_id', { length: 64 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 32 }).default('member').notNull(), // 'owner' | 'member' | 'viewer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('workspace_member_unique_idx').on(table.workspaceId, table.userId),
]);

// --- Workspace Page Trees (Sidebar hierarchy) ---
export const workspaceTrees = pgTable('workspace_trees', {
  workspaceId: varchar('workspace_id', { length: 64 })
    .primaryKey()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  version: bigint('version', { mode: 'number' }).default(0).notNull(),
  nodes: jsonb('nodes').$type<WorkspacePageMeta[]>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Pages (Sidebar tree hierarchy nodes) ---
export const pages = pgTable('pages', {
  id: varchar('id', { length: 64 }).primaryKey(), // e.g. "page_xxxx"
  workspaceId: varchar('workspace_id', { length: 64 })
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: varchar('parent_id', { length: 64 }),
  title: varchar('title', { length: 255 }).default('Untitled').notNull(),
  icon: varchar('icon', { length: 64 }),
  isBookmarked: boolean('is_bookmarked').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  version: bigint('version', { mode: 'number' }).default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('pages_workspace_id_idx').on(table.workspaceId),
]);

// --- Document JSON Content ---
export const documents = pgTable('documents', {
  id: varchar('id', { length: 64 })
    .primaryKey()
    .references(() => pages.id, { onDelete: 'cascade' }),
  workspaceId: varchar('workspace_id', { length: 64 })
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  version: bigint('version', { mode: 'number' }).default(1).notNull(),
  content: jsonb('content').$type<DocumentJSON>().notNull(), // Strongly typed block tree!
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('documents_workspace_id_idx').on(table.workspaceId),
]);

// --- Append-Only Sync Log (The heart of local-first delta replication) ---
export const syncLog = pgTable('sync_log', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 })
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  version: bigint('version', { mode: 'number' }).notNull(), // Monotonic sequence per workspace
  entityType: varchar('entity_type', { length: 32 }).notNull(), // 'workspace' | 'workspace_tree' | 'page' | 'document' | 'tag'
  entityId: varchar('entity_id', { length: 64 }).notNull(),
  operation: varchar('operation', { length: 16 }).notNull(), // 'upsert' | 'delete'
  patch: jsonb('patch').notNull(), // The serialized entity delta or full representation
  clientMutationId: varchar('client_mutation_id', { length: 64 }), // Deduplication / Idempotency key
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sync_log_workspace_version_idx').on(table.workspaceId, table.version),
  uniqueIndex('sync_log_client_mutation_idx').on(table.clientMutationId),
]);

// --- CRDT Document Updates (Yjs Binary Delta Updates) ---
export const documentCrdtUpdates = pgTable('document_crdt_updates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 })
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  documentId: varchar('document_id', { length: 64 })
    .references(() => pages.id, { onDelete: 'cascade' })
    .notNull(),
  updateData: text('update_data').notNull(), // Base64 encoded binary Yjs update
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('crdt_updates_doc_idx').on(table.documentId),
  index('crdt_updates_ws_idx').on(table.workspaceId),
]);
