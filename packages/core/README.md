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

### 3. Identity & ID Generator (`src/lib/id.ts`)
Centralized typed nanoid generators:
- `generatePageId()` -> `page_<id>`
- `generateBlockId()` -> `blk_<id>`
- `generateWorkspaceId()` -> `ws_<id>`
- `generateCardId()` -> `crd_<id>`

### 4. Services (`src/services`)
- **`DocumentService`**: High-level CRUD, cloning, and document export/import.
- **`WorkspaceService`**: Workspace initialization and defaults seeding.
- **`LinkPreviewService`**: Metadata extraction for URL cards.
- **`SearchService`**: In-memory full-text search indexing across titles and blocks.

## Scripts

```bash
# Typecheck core
pnpm build

# Run Vitest unit tests
pnpm test
```
