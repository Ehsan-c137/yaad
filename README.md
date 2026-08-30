# Yaad

A calm, personal space for your notes, workspaces, and thoughts. Built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org), and [Tailwind CSS](https://tailwindcss.com).

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Bun](https://img.shields.io/badge/Bun-ready-f472b6)

Repository: [https://github.com/Ehsan-c137/yaad](https://github.com/Ehsan-c137/yaad)

---

## Features ✨

- 🗂️ **Workspaces** — organize pages into separate spaces and switch between them.
- 📝 **Block-based editor** — compose pages from text, todos, callouts, code, quotes, tables, images, files, and sub-pages, with a slash menu for quick inserts.
- 🌲 **Nested pages & breadcrumbs** — pages can live inside other pages, with breadcrumbs to keep your place.
- 🕸️ **Graph view** — see how your pages connect, per workspace or per page.
- 🔍 **Command palette search** — jump to any page or run actions with a quick keyboard-driven search.
- 🅰️ **Tabs** — open multiple pages side by side, browser-style.
- 📥 **Inbox** — a home for notifications and quick captures.
- 🌗 **Light & dark mode** — switch appearance from settings.
- 🌍 **RTL-friendly UI** — built with CSS logical properties so it works in both directions.
- 🔒 **Local-first & private** — your data lives in your browser (IndexedDB), with export/import backup included.
- 🔗 **Link previews** — paste a link and get a rich preview card.
- 📱 **Responsive layout** — works on desktop and mobile.

---

## Tech Stack 🧰

| Layer     | Tools                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------ |
| Framework | [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev)                          |
| Language  | [TypeScript](https://www.typescriptlang.org) (strict)                                            |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI, Lucide) |
| State     | [Zustand](https://zustand.docs.pmnd.rs) (sliced stores)                                          |
| Storage   | [IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API) via `idb-keyval`           |
| Graph     | [@xyflow/react](https://reactflow.dev) + [d3-force](https://d3js.org/d3-force/)                  |
| Tooling   | [Bun](https://bun.sh), ESLint, Prettier                                                          |

---

## Getting Started 🚀

You'll need [Bun](https://bun.sh) installed (the repo is pinned to Bun 1.3+).

First, install dependencies and run the development server:

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

No environment variables are required to run the app locally.

### Production Build

```bash
bun run build
bun start
```

---

## Available Scripts 📜

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `bun dev`              | Start the development server             |
| `bun run build`        | Create a production build                |
| `bun start`            | Serve the production build               |
| `bun run lint`         | Run ESLint                               |
| `bun run lint:fix`     | Run ESLint and auto-fix issues           |
| `bun run format`       | Format the codebase with Prettier        |
| `bun run format:check` | Check formatting without writing changes |
| `bun run check`        | Lint + formatting check in one go        |
| `bun run fix`          | Auto-fix lint issues + format everything |
| `bun x tsc --noEmit`   | Type-check the project                   |

---

## Project Structure 🏗️

```
src/
├── app/                  # App Router pages (workspaces, pages, graph) + API routes
├── components/
│   ├── editor/           # Block-based editor (blocks, slash menu, menus, side peek)
│   ├── graph/            # Graph view (React Flow + d3-force)
│   ├── layout/           # Sidebar, tabs, breadcrumbs, mobile nav, settings
│   ├── pages/            # Top-level page compositions
│   ├── search/           # Command palette search
│   └── ui/               # shadcn/ui primitives
├── constants/            # Routes and other constants
├── context/              # Editor context
├── hooks/                # Reusable hooks (editor, search, settings, sidebar)
├── lib/                  # Utilities, editor internals, sanitizer, storage layer
│   └── storage/          # Local-first storage + backup export/import
├── providers/            # Theme provider, workspace initializer
├── services/             # Document & workspace services
├── store/                # Zustand stores (sidebar, tabs, workspace, document, inbox)
└── types/                # Shared TypeScript types
```

---

## Want to Contribute? 🤝

Contributions of any kind are welcome — bug fixes, new features, documentation, design ideas, and everything in between.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the project, the conventions we follow, and how to open a pull request.

Thank you for helping make Yaad better! ✨
