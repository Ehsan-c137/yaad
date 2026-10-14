# @yaad/core

The headless business logic and state management layer for Yaad.

---

## Overview

`@yaad/core` contains zero UI or DOM-rendering dependencies, making it universally portable across desktop, web, worker threads, and CLI environments.

## Subsystems

### 1. Storage (`src/lib/storage`)

- **`StorageAdapter` Interface**: Generic contract for reading/writing workspaces, pages, trees, trash, and tags.
- **`TauriSqlAdapter`**: SQLite implementation using `@tauri-apps/plugin-sql` for desktop environments.
- **`LocalJsonAdapter`**: IndexedDB implementation using `idb-keyval` for browser & PWA environments.
- **`storage` Proxy**: Dynamic proxy in `storage-provider.ts` that auto-routes calls to the active platform adapter.

### 2. State Management (`src/store`)

- **`useWorkspaceStore`**: Global workspace state and switching.
- **`useSidebarStore`**: Slices for pages hierarchy (`pages-slice.ts`) and sidebar UI toggles (`ui-slice.ts`).
- **`useTabStore`**: Tab history, navigation, and automatic memory eviction of closed document stores.
- **`useTagStore`**: Tags taxonomy and indexing.
- **`useDocumentStore(pageId)`**: Factory producing isolated, per-page stores for block edits and autosaving.

### 3. CRDT & Collaboration (`src/lib/crdt`)

- **`CollabClient`**: Manages real-time WebSocket connections to `/collab`, Yjs state-vector synchronization handshakes, live binary delta exchange, awareness states (cursors and selections), real-time tree sync, and permission revocation events.
- **`yjs-converter.ts`**: Bi-directional conversion utilities translating between canonical `DocumentJSON` (blocks, root children, metadata) and Yjs CRDT shared data structures (`Y.Doc`, `Y.Map`, `Y.Array`, `Y.Text`).

### 4. Offline Delta Sync Engine (`src/lib/sync`)

- **`OutboxQueue`**: Local FIFO mutation queue buffering offline mutations with unique `clientMutationId`s for idempotent server execution.
- **`SyncWorker`**: Background worker orchestrating atomic batch pushes (`POST /sync/push`) and delta pulls (`POST /sync/pull`) against the NestJS sync engine.
- **`SyncOutboxStorageAdapter`**: Transparent decorator wrapping `StorageAdapter` to record mutations upon local storage writes.

### 5. Workspace Permissions & Sharing (`src/lib/workspace` & `src/services`)

- **`WorkspacePermissions`**: Role hierarchy definitions (`OWNER`, `EDITOR`, `VIEWER`) and permission evaluation logic (`canEdit`, `isOwner`, `isViewer`).
- **`WorkspaceMemberService`**: REST client for retrieving members, updating roles, inviting collaborators, and leaving workspaces.

### 6. Identity & ID Generator (`src/lib/id.ts`)

Centralized typed nanoid generators:

- `generatePageId()` -> `page_<id>`
- `generateBlockId()` -> `block_<id>`
- `generateWorkspaceId()` -> `ws_<id>`
- `generateCardId()` -> `card_<id>`

### 7. Services (`src/services`)

- **`DocumentService`**: High-level CRUD, cloning, and document export/import.
- **`WorkspaceService`**: Workspace initialization and defaults seeding.
- **`WorkspaceMemberService`**: Workspace collaborator access control and invitation management.
- **`LinkPreviewService`**: Metadata extraction for URL cards.
- **`SearchService`**: In-memory full-text search indexing across titles and blocks.

## Scripts

```bash
# Typecheck core
pnpm build

# Run Vitest unit tests
pnpm test
```
