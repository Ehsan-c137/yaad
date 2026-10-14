# @yaad/ui

The UI component library, block editor canvas, knowledge graph, and design system for Yaad.

---

## Overview

`@yaad/ui` provides the presentation layer for both the desktop and web applications. It is built with React 19, Tailwind CSS v4, Base UI primitives, and XYFlow.

## Key Modules

### 1. Block Editor (`src/components/editor`)

- **`EditorShell`**: The root editor container managing header, covers, title, icon picker, and canvas.
- **`BlockCanvas`**: Renders the hierarchical tree of blocks with drag-and-drop handles and block selections.
- **`BlockRenderer`**: Routes block data to specific block element components.
- **`useEditableBlock`**: Custom hook managing common block actions (contenteditable bindings, keyboard handlers, type transformation, slash command triggering).
- **Block Elements (`src/components/editor/block/elements`)**:
  - `TextBlock` (Paragraphs, Headings H1-H3)
  - `TodoBlock` (Checklist items with state toggling)
  - `BulletListBlock` (Bulleted items)
  - `QuoteBlock` (Blockquotes with left-border accents)
  - `CodeBlock` (Code snippets with syntax highlighting)
  - `CalloutBlock` (Custom colored callouts with emoji/icon)
  - `TableBlock` (Multi-cell tabular data)
  - `KanbanBlock` (Drag-and-drop task boards)
  - `ImageBlock` & `LinkPreviewBlock`
  - `PageBlock` (Subpage navigation cards)
  - `SeparatorBlock` (Horizontal dividing lines)

### 2. Real-Time Collaboration & Overlays (`src/components/editor/collab` & `src/components/editor/header`)

- **`RemoteCursorOverlay`**: Renders live remote cursor flags and selection ranges across contenteditable blocks for active room collaborators.
- **`CollabPresence`**: Visual peer presence avatars in the page header with tooltips and connection rings.
- **`SyncStatusIndicator`**: Real-time visual badge communicating persistence status (`synced`, `syncing`, `offline`, `error`).
- **`useCollab`**: Custom hook binding `CollabClient` lifecycle, Yjs text synchronizations, and presence telemetry to the active document.

### 3. Slash Menu (`src/components/editor/slash-menu`)

- Triggered by typing `/` in any editable block.
- Searchable command palette offering quick block type conversion or new block insertion.

### 4. Workspace Sharing & Permissions (`src/components/workspace` & `src/hooks/workspace`)

- **`ShareModal`**: Multi-section modal for managing collaborators, changing roles (`OWNER`, `EDITOR`, `VIEWER`), copying invite links, and revoking memberships.
- **`JoinWorkspacePrompt`**: Streamlined modal allowing users to preview and accept workspace collaboration invites.
- **`useWorkspacePermissions`**: Capability hook exposing permission flags (`canEdit`, `isOwner`, `isViewer`, `role`) and enforcing read-only lockdowns across editor blocks, slash commands, and tree manipulation.

### 5. Knowledge Graph (`src/components/graph` & `src/components/pages/graph-page.tsx`)

- Interactive force-directed node-link visualization powered by `@xyflow/react` and `d3-force`.
- Supports workspace-level exploration and localized page-centric neighborhoods.

### 6. Layout & Navigation (`src/components/layout`)

- **`MainLayout`**: Hosts the resizable sidebar, top navigation tab bar, share modal trigger, and global search modal (`Cmd/Ctrl + K`).
- **Sidebar**: Tree view with expandable nodes, drag-and-drop reordering, bookmarks, and trash view.

## Scripts

```bash
# Typecheck UI
pnpm build

# Run UI component tests
pnpm test
```
