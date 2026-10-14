# Yaad Backend API (`@yaad/api`)

Production-ready NestJS backend powering Yaad's **local-first mutation-driven delta sync** and **real-time CRDT multiplayer collaboration**.

---

## 1. Overview & Architecture

Yaad's backend is built using **NestJS**, **PostgreSQL**, **Drizzle ORM**, and **Yjs**:

- **Local-First Delta Sync**: Clients edit offline and accumulate pending mutations in a local outbox. When connected, mutations are batched and executed atomically on the server via `POST /api/v1/sync/push`, bumping a monotonic version number and appending to an immutable `sync_log`.
- **CRDT Real-Time Multiplayer**: Built with Yjs over WebSocket (`/collab`). Keeps documents synchronized with character/block-level conflict-free resolution, broadcast streaming (< 20ms latency), and live presence (collaborator cursors and active block focus).
- **Dual-Layer Storage**: Raw CRDT updates are stored as binary deltas in PostgreSQL (`document_crdt_updates`). A debounced worker continuously materializes in-memory Yjs documents into canonical `DocumentJSON` (`documents.content`), ensuring relational queries and full-text search remain fast and standard.
- **Enterprise Security**: JWT-based authentication with `bcryptjs` password hashing, protected by `JwtAuthGuard` and multi-tenant `WorkspaceMemberGuard`.

For in-depth architectural trade-offs, read the Architecture Decision Records:
- [ADR 0001: Local-First Mutation-Driven Sync Engine](../../docs/adr/0001-local-first-sync-engine.md)
- [ADR 0002: CRDT-Powered Real-Time Collaborative Multiplayer](../../docs/adr/0002-crdt-collaborative-multiplayer.md)

---

## 2. Quickstart & Local Setup

### Prerequisites
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker & Docker Compose (for PostgreSQL)

### 1. Start PostgreSQL
```bash
# In apps/api
pnpm docker:up
```
This spins up PostgreSQL 16 on port `5432` with database `yaad`.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/yaad"
PORT=3000
JWT_SECRET="yaad-default-secret-key-change-in-production"
```

### 3. Push Schema to Database
```bash
pnpm db:push
```

### 4. Run Development Server
```bash
pnpm start:dev
```
The server will start listening at `http://localhost:3000`.

### 5. Run Test Suite
```bash
pnpm test
```

---

## 3. REST API Reference

Base URL: `http://localhost:3000` (or `http://localhost:3000/api/v1`)

### Authentication (`/auth`)

#### `POST /auth/register`
Creates a user account, provisions a default workspace (`"My Workspace"`), adds the user as `owner`, and returns an access token.

- **Request Body**:
```json
{
  "email": "alice@yaad.app",
  "password": "securePassword123",
  "name": "Alice"
}
```
- **Response `201 Created`**:
```json
{
  "user": {
    "id": "7b0b30bb-75dc-4258-86d1-44aa04085f1c",
    "email": "alice@yaad.app"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "defaultWorkspaceId": "ws_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
}
```

---

#### `POST /auth/login`
Validates credentials and returns an access token.

- **Request Body**:
```json
{
  "email": "alice@yaad.app",
  "password": "securePassword123"
}
```
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "7b0b30bb-75dc-4258-86d1-44aa04085f1c",
    "email": "alice@yaad.app"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### `GET /auth/me`
Returns the authenticated user's profile.

- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "id": "7b0b30bb-75dc-4258-86d1-44aa04085f1c",
  "email": "alice@yaad.app"
}
```

---

### Delta Sync API (`/sync`)

All sync routes require:
- `Authorization: Bearer <accessToken>`
- Valid membership in target `workspaceId` (enforced via `WorkspaceMemberGuard`).

#### `POST /sync/push`
Atomically applies a batch of local mutations, ensures idempotency via `clientMutationId`, appends records to `sync_log`, and increments the workspace's monotonic version.

- **Request Body**:
```json
{
  "workspaceId": "ws_1a2b3c4d",
  "clientId": "client_laptop_xyz",
  "mutations": [
    {
      "clientMutationId": "mut_d290f1ee-6c54-4b01-90e6-d701748f0851",
      "entityType": "page",
      "entityId": "page_9b1deb4d",
      "operation": "upsert",
      "payload": {
        "title": "Quarterly Objectives",
        "icon": "🎯",
        "parentId": null,
        "isBookmarked": false
      }
    }
  ]
}
```
- **Supported `entityType` values**: `'workspace'`, `'workspace_tree'`, `'page'`, `'document'`, `'tag'`.
- **Supported `operation` values**: `'upsert'`, `'delete'`.
- **Response `200 OK`**:
```json
{
  "acceptedMutationIds": ["mut_d290f1ee-6c54-4b01-90e6-d701748f0851"],
  "lastServerVersion": 42
}
```

---

#### `POST /sync/pull`
Fetches all delta changes that occurred after the client's last known version.

- **Request Body**:
```json
{
  "workspaceId": "ws_1a2b3c4d",
  "sinceVersion": 41,
  "limit": 500
}
```
- **Response `200 OK`**:
```json
{
  "changes": [
    {
      "id": "log_uuid",
      "version": 42,
      "entityType": "page",
      "entityId": "page_9b1deb4d",
      "operation": "upsert",
      "patch": {
        "title": "Quarterly Objectives",
        "icon": "🎯"
      },
      "clientMutationId": "mut_d290f1ee...",
      "createdAt": "2026-10-14T01:00:00.000Z"
    }
  ],
  "latestVersion": 42,
  "hasMore": false
}
```

---

#### `GET /sync/pull`
Query parameter equivalent for delta pull.

- **Query Parameters**:
  - `workspaceId`: `string` (required)
  - `sinceVersion`: `number` (optional, default `0`)
  - `limit`: `number` (optional, default `500`)
- **Response `200 OK`**: Identical to `POST /sync/pull`.

---

## 4. Real-Time Collaborative WebSocket API

- **Protocol**: Standard WebSocket (`ws://` / `wss://`)
- **Path**: `/collab`
- **Adapter**: `WsAdapter` (`@nestjs/platform-ws`)

### 1. Join Room (`join-room`)
Initiates the 2-step Yjs sync handshake.

- **Client Message**:
```json
{
  "event": "join-room",
  "data": {
    "workspaceId": "ws_1a2b3c4d",
    "documentId": "page_9b1deb4d",
    "token": "eyJhbGciOi...",
    "stateVector": "AQID..."
  }
}
```
- **Server Response (`sync-step-2`)**:
The server computes the delta updates missing on the client using the client's state vector:
```json
{
  "event": "sync-step-2",
  "documentId": "page_9b1deb4d",
  "update": "AQIDBAUGBw..."
}
```

---

### 2. Live Document Edits (`sync-update`)
Clients stream incremental binary CRDT updates as they type.

- **Client Message**:
```json
{
  "event": "sync-update",
  "data": {
    "workspaceId": "ws_1a2b3c4d",
    "documentId": "page_9b1deb4d",
    "update": "AQIDBAU..."
  }
}
```
- **Server Behavior**:
  1. Applies update to in-memory `Y.Doc`.
  2. Persists update to PostgreSQL `document_crdt_updates`.
  3. Broadcasts the update to all **other** clients in the room:
     ```json
     {
       "event": "sync-update",
       "documentId": "page_9b1deb4d",
       "update": "AQIDBAU..."
     }
     ```

---

### 3. Ephemeral Presence & Cursors (`awareness-update`)
Transmits live collaborator cursors and active block selections without database persistence.

- **Client Message**:
```json
{
  "event": "awareness-update",
  "data": {
    "workspaceId": "ws_1a2b3c4d",
    "documentId": "page_9b1deb4d",
    "awarenessData": {
      "user": {
        "name": "Alice",
        "color": "#7C3AED"
      },
      "activeBlockId": "blk_123",
      "cursor": { "anchor": 5, "head": 12 }
    }
  }
}
```
- **Server Broadcast**: Relayed immediately to all other collaborators in the room.

---

## 5. PostgreSQL Database Schema

```mermaid
erDiagram
    users ||--o{ workspaces : owns
    users ||--o{ workspace_members : participates
    workspaces ||--o{ workspace_members : includes
    workspaces ||--|| workspace_trees : has
    workspaces ||--o{ pages : contains
    pages ||--|| documents : has
    workspaces ||--o{ sync_log : logs
    pages ||--o{ document_crdt_updates : accumulates

    users {
        varchar id PK
        varchar email UK
        varchar password_hash
        timestamp created_at
    }

    workspaces {
        varchar id PK
        varchar name
        varchar owner_id FK
        bigint current_version
        boolean is_deleted
    }

    workspace_members {
        varchar id PK
        varchar workspace_id FK
        varchar user_id FK
        varchar role
    }

    pages {
        varchar id PK
        varchar workspace_id FK
        varchar parent_id
        varchar title
        varchar icon
        boolean is_bookmarked
        boolean is_deleted
        bigint version
    }

    documents {
        varchar id PK, FK
        varchar workspace_id FK
        bigint version
        jsonb content
        timestamp updated_at
    }

    sync_log {
        varchar id PK
        varchar workspace_id FK
        bigint version
        varchar entity_type
        varchar entity_id
        varchar operation
        jsonb patch
        varchar client_mutation_id UK
    }

    document_crdt_updates {
        varchar id PK
        varchar workspace_id FK
        varchar document_id FK
        text update_data
        timestamp created_at
    }
```