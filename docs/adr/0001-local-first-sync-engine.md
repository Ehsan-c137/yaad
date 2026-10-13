# 0001: Local-First Mutation-Driven Sync Engine

## Status
Accepted

## Context
Yaad is a modular personal knowledge management and block-based workspace platform supporting both desktop (Tauri v2 + SQLite via `TauriSqlAdapter`) and web (IndexedDB via `LocalJsonAdapter`). Users require zero-latency document editing, full offline functionality, and resilient background synchronization across devices when connected.

Standard client-server REST APIs (`PUT /pages/:id`, `PATCH /documents/:id`) fail in offline environments because they lead to race conditions, overwrite concurrent edits from other devices, and lack a mechanism to replay offline mutations.

## Decision
We will implement an **asymmetric, mutation-driven delta sync engine** using NestJS and PostgreSQL (via Drizzle ORM):

1. **Local Storage as Primary Source of Truth**:
   - The client UI reads and writes exclusively to local storage (SQLite on Desktop, IndexedDB on Web).
   - Local mutations are appended to an offline FIFO `outbox` queue with a unique `clientMutationId` (UUID) for idempotency.

2. **Push/Pull Delta Sync Protocol**:
   - `POST /api/v1/sync/push`: The client flushes batches of queued mutations. The NestJS backend executes them in an atomic PostgreSQL transaction, skips already-processed mutations via `clientMutationId`, updates entity tables, appends to `sync_log`, and increments a monotonic per-workspace `server_version`.
   - `POST /api/v1/sync/pull`: The client requests changes using a high-water mark (`sinceVersion`). The server returns matching delta records from `sync_log`.

3. **Push-to-Pull Notification Relay**:
   - WebSocket/SSE signals lightweight notifications (`{ workspaceId, version }`). The client initiates a standard `pull` request upon receipt, keeping the sync protocol resilient to network drops and disconnects.

4. **Tombstones for Deletion**:
   - Hard deletes are prohibited across synced entities (`workspaces`, `pages`, `documents`, `tags`). Entities utilize an `is_deleted` flag and `deleted_at` timestamp so deletions replicate reliably to offline devices.

## Considered Options

- **CRDT Relay (Yjs / Automerge)**:
  - *Deferred/Scoped*: Yaad's atomic block structure (`DocumentBlock`) does not require character-level multiplayer editing for primary sync. Storing opaque CRDT binary blobs in PostgreSQL hinders server-side search, migrations, and relational tree queries. CRDTs can be added later as an ephemeral in-memory layer for active collaborative rooms if needed.
- **Direct Dual-Write REST CRUD (`POST /pages`, `PUT /pages/:id`)**:
  - *Rejected*: Lacks offline queuing, causes Last-Write-Wins clobbering across entire page payloads, and makes network reconciliation brittle.
- **Third-Party Sync-as-a-Service (ElectricSQL / PowerSync)**:
  - *Deferred*: Introduces external cloud dependencies and non-standard PostgreSQL replication extensions. A lightweight NestJS transactional sync log provides full control over authentication, rate limiting, and self-hosted deployments.

## Consequences

- **Positive**:
  - 100% offline capability with zero UI latency.
  - Granular mutation logging allows auditability, backup point-in-time recovery, and conflict debugging.
  - Relational schema in PostgreSQL remains queryable for server-side full-text search and web features.
- **Negative / Costs**:
  - Client storage adapters (`TauriSqlAdapter`, `LocalJsonAdapter`) must maintain a local `outbox` table and track `last_synced_version`.
  - The server must periodically compact/prune old `sync_log` entries against baseline document snapshots to prevent unbounded table growth.
