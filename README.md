# Yaad (یاد)

A modern, fast, local-first personal knowledge management and block-based workspace application. Built with a modular monorepo architecture supporting both desktop (Tauri v2) and web (Vite + PWA) environments.

---

## Features

- **Local-First Architecture**: Your data stays on your device. Zero cloud lock-in. Uses SQLite on desktop and IndexedDB on web with an unified, transparent storage adapter abstraction.
- **Block-Based Editor**: Notion-style modular canvas supporting rich blocks:
  - Paragraphs, Headings (H1, H2, H3), Bullet Lists, Todo Lists with checkboxes, Blockquotes
  - Code Blocks with syntax highlighting, Callouts with custom icons/accents
  - Interactive Tables, Kanban Boards with draggable cards
  - Images, Link Previews with metadata extraction, Separators/Dividers, and Sub-pages
  - Slash command menu (`/`), keyboard shortcuts, and type transformation
- **Interactive Knowledge Graph**: Visual node-edge graph visualization powered by `@xyflow/react` and `d3-force`. Explore workspace-wide connections or zoom into page-specific link neighborhoods.
- **Hierarchical Sidebar & Workspaces**: Nested drag-and-drop page tree, quick bookmarks, tags, and a trash bin with soft-delete and restore capabilities.
- **Multi-Tab Workflow**: Fast tab navigation with automatic memory management and store eviction for closed documents.
- **Global Command Search**: Fast full-text workspace search across page titles, block content, and tags.
- **Dual Target Distribution**:
  - **Desktop**: Lightweight native binary powered by Tauri v2 with native SQLite storage.
  - **Web & PWA**: Installable progressive web app with offline persistence and instant load.

---

## Monorepo Architecture

Yaad is structured as a pnpm monorepo separating business logic, UI components, and application wrappers:

```
yaad/
├── apps/
│   ├── desktop/             # Native desktop app (Tauri v2 + React 19 + Tailwind v4)
│   └── web/                 # Web & PWA app (Vite + React 19 + Tailwind v4)
├── packages/
│   ├── core/                # Business logic, stores, storage adapters, services, types
│   ├── ui/                  # Block editor, graph viewer, design system, components
│   └── config/              # Shared TypeScript configurations
└── public/                  # Static assets & favicons
```

### Package Overview

| Package             | Path                                   | Description                                                                                                                                  |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@yaad/core`**    | [`packages/core`](./packages/core)     | Pure domain logic, Zustand stores (document, sidebar, tabs, tags, workspace), storage engine, and typed ID generators. Zero UI dependencies. |
| **`@yaad/ui`**      | [`packages/ui`](./packages/ui)         | Block canvas, block element renderers, slash menu, interactive graph, Base UI components, and Tailwind v4 design tokens.                     |
| **`@yaad/config`**  | [`packages/config`](./packages/config) | Shared tsconfig presets (`base.json`, `react-app.json`).                                                                                     |
| **`@yaad/desktop`** | [`apps/desktop`](./apps/desktop)       | Tauri v2 desktop application bundling `@yaad/core` and `@yaad/ui` with native SQLite database persistence.                                   |
| **`@yaad/web`**     | [`apps/web`](./apps/web)               | Browser and PWA application bundling `@yaad/core` and `@yaad/ui` with IndexedDB persistence.                                                 |

---

## Getting Started

### Prerequisites

- **Node.js**: `v20+` or `v22+` recommended
- **Package Manager**: `pnpm` (v9 or v11, specified via `"packageManager": "pnpm@11.15.1"`)
- **Rust & Tauri CLI** (Only required for desktop development): [Rust toolchain](https://www.rust-lang.org/) and [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/yaad.git
cd yaad
pnpm install
```

---

## Development Scripts

Run scripts from the workspace root:

| Command            | Action                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| `pnpm dev:web`     | Start the Web application Vite dev server (runs on `http://localhost:5173`)  |
| `pnpm dev:desktop` | Launch the native desktop application in Tauri development mode              |
| `pnpm test`        | Run Vitest test suites across all packages                                   |
| `pnpm build`       | Compile TypeScript and build production bundles across all packages and apps |
| `pnpm tauri`       | Pass CLI commands directly to Tauri (e.g. `pnpm tauri info`)                 |

---

## Testing

Yaad maintains a comprehensive test suite covering core domain models, ID generation, storage providers, Zustand stores, and UI block elements:

```bash
# Run all tests across the monorepo
pnpm test

# Run tests specifically in core
pnpm --filter @yaad/core test

# Run tests specifically in UI
pnpm --filter @yaad/ui test
```

---

## Deployment & Production Builds

### Web Application (Vercel / Static Hosting)

The web application is ready for zero-config deployment on Vercel or any static host:

- **Root Directory**: Project root (`.`)
- **Build Command**: `pnpm --filter @yaad/web build`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `pnpm install`

### Desktop Application (Tauri Bundling)

To compile native installers (Windows `.msi` / `.exe`, macOS `.dmg` / `.app`, Linux `.deb` / `.AppImage`):

```bash
pnpm --filter @yaad/desktop tauri build
```

Built binaries will be placed in `apps/desktop/src-tauri/target/release/bundle/`.

---

## License

Private / Proprietary. All rights reserved.
