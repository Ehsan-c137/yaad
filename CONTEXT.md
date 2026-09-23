# Yaad Domain Context

Yaad is a local-first, modular personal knowledge management and block-based workspace platform supporting both desktop (Tauri v2) and web environments.

## Language

### Core Entities

**Workspace**:
A top-level container encapsulating an independent collection of pages, tags, and settings.
_Avoid_: Project, notebook, vault

**Page**:
A document entity identified by a `page_` prefix that contains metadata, an icon/cover, and a tree of content blocks.
_Avoid_: Note, file, entry

**Document JSON**:
The serialized data structure representing a page's complete block map, root block ID, title, icon, and timestamps.
_Avoid_: Note body, content file, document payload

**Block**:
An atomic unit of content within a page, identified by a `blk_` prefix with a specific type, properties, and child IDs.
_Avoid_: Element, widget, component (when referring to the data model)

**Root Block**:
The top-level container block of a page whose child array defines the visible top-level order of blocks.
_Avoid_: Master block, base block, document root

**Block Type**:
The structural definition of a block (such as `paragraph`, `heading_1`, `todo`, `separator`, `quote`, `callout`, `table`, `kanban`, `link_preview`, `page`).
_Avoid_: Block style, block category

### State & Lifecycle

**Tab Store**:
The global state container tracking active navigation tabs and managing the lifecycle of per-document store instances.
_Avoid_: Window manager, tab bar state

**Document Store**:
An isolated Zustand store instantiated per active page ID that manages block editing, undo/redo, and autosave.
_Avoid_: Editor store, page cache

**Sidebar Tree**:
The hierarchical representation of pages organized with parent-child relationships, bookmarked flags, and trash states.
_Avoid_: Navigation menu, file tree, explorer

**Trash**:
The soft-delete holding area for pages that enables non-destructive deletion and restoration before permanent removal.
_Avoid_: Recycle bin, archive, deleted folder

### Storage & Persistence

**Storage Adapter**:
The unified interface abstraction implemented by persistent storage backends for reading and writing documents and metadata.
_Avoid_: Database driver, repository, persistence layer

**Tauri SQL Adapter**:
The SQLite-backed storage adapter implementation used when running natively under the Tauri desktop runtime.
_Avoid_: Desktop DB, local SQLite

**Local JSON Adapter**:
The IndexedDB-backed storage adapter implementation used when running in browser and PWA environments.
_Avoid_: Web storage, browser cache, local storage

### Knowledge & Exploration

**Knowledge Graph**:
The interactive visual node-and-edge graph depicting connections and cross-references between pages and blocks.
_Avoid_: Mind map, network diagram, relation graph

**Tag**:
A categorized label with a color that can be attached to pages or individual blocks to facilitate cross-cutting discovery.
_Avoid_: Label, hashtag, category
