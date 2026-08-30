# Contributing to Yaad 🤝

Thank you for your interest in contributing! Yaad is a calm, personal space for notes, workspaces, and thoughts, and every kind of contribution helps — code, docs, design, bug reports, and ideas.

## Ways to Contribute

- 🐛 **Report bugs** — [Open an issue](https://github.com/Ehsan-c137/yaad/issues) describing the problem and steps to reproduce.
- 💡 **Suggest features** — Share ideas for new capabilities or design refinements.
- 🛠️ **Code & UI improvements** — Optimize performance, extend accessibility, or refine components.
- 📖 **Documentation** — Improve the README, guides, or inline comments.
- 🎨 **Design feedback** — Thoughts on layout, interactions, and the overall "calm" feel.

> For larger changes (new features, architectural changes), please open an issue first so we can discuss the approach before you invest a lot of time.

## Getting Set Up

### Prerequisites

- [Bun](https://bun.sh) 1.3+ (the repo is pinned via `packageManager`)
- [Git](https://git-scm.com)
- Node.js is **not** required separately — Bun handles it

### Setup

1. **Fork the repository** — click the **Fork** button at [github.com/Ehsan-c137/yaad](https://github.com/Ehsan-c137/yaad).

2. **Clone your fork**

   ```bash
   git clone https://github.com/<your-username>/yaad.git
   cd yaad
   ```

3. **Install dependencies**

   ```bash
   bun install
   ```

4. **Start the dev server**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — no environment variables are needed for local development.

## Project Overview

A quick map of the codebase so you know where to make changes:

```
src/
├── app/            # Next.js App Router routes (workspace, page, graph) + API routes
├── components/
│   ├── editor/     # Block-based editor: blocks, slash menu, action menus, side peek
│   ├── graph/      # Graph view (React Flow + d3-force)
│   ├── layout/     # Sidebar, tabs, breadcrumbs, mobile nav, settings modal
│   ├── search/     # Command palette search
│   └── ui/         # shadcn/ui primitives (base-rhea style, Lucide icons)
├── hooks/          # Reusable hooks grouped by domain (editor, search, settings, sidebar)
├── lib/            # Utilities, editor internals, HTML sanitizer, storage layer
│   └── storage/    # Local-first IndexedDB storage + backup export/import
├── providers/      # Theme provider, workspace initializer
├── services/       # Document & workspace services
├── store/          # Zustand stores, sliced per domain
└── types/          # Shared TypeScript types
```

**Architecture notes:**

- **Local-first:** user data lives in the browser (IndexedDB via `idb-keyval`). Anything that reads or writes user data should go through `src/lib/storage/` / `src/services/`, never talk to storage directly from components.
- **State:** client state uses [Zustand](https://zustand.docs.pmnd.rs) stores in `src/store/`, split into slices (e.g. `store/document/`, `store/sidebar/`).
- **Styling:** Tailwind CSS 4 with design tokens defined in `src/app/globals.css`. Use CSS logical properties (`inline-start`, `ms-auto`, …) so layouts stay RTL-friendly.
- **UI primitives:** live in `src/components/ui/` and follow the shadcn/ui style configured in `components.json`.

## Coding Conventions

- **TypeScript strict mode** is on — keep types honest, avoid `any`.
- **File naming:** kebab-case for files (`block-canvas.tsx`), PascalCase for component exports (`BlockCanvas`).
- **Path aliases:** `@/*` maps to `src/*` and `@ui/*` to `src/components/ui/*` — use them instead of relative imports where the codebase already does.
- **Formatting:** Prettier with LF line endings (`.prettierrc`); ESLint uses the shared `@fullstacksjs/eslint-config`.
- **Commits:** follow [Conventional Commits](https://www.conventionalcommits.org) (see below).

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org) format:

```
<type>(<optional scope>): <short description>
```

| Type       | When to use                        |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `docs`     | Documentation only                 |
| `style`    | Formatting, no logic change        |
| `refactor` | Code change that is not a fix/feat |
| `perf`     | Performance improvement            |
| `test`     | Adding or fixing tests             |
| `chore`    | Tooling, deps, config, etc.        |

Examples:

```
feat: add favorite pages to the sidebar
fix(editor): keep focus when merging blocks
docs: add graph view to the README
```

## Branches

Create a branch from `main` for each piece of work:

```bash
git checkout -b feat/my-new-feature   # or fix/, docs/, chore/
```

## Before You Open a Pull Request

Make sure all of these pass locally:

```bash
bun run check        # ESLint + Prettier check
bun x tsc --noEmit   # Type check
bun run build        # Production build succeeds
```

If lint or formatting issues show up, `bun run fix` will auto-fix most of them. Some pre-existing lint warnings and errors exist in the codebase — you don't need to fix all of them, just make sure your changes don't introduce new ones.

There is no automated test suite yet — if you'd like to add one, that's a very welcome contribution! Until then, please verify your change in the running app and mention what you tested in your PR.

## Opening a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feat/my-new-feature
   ```

2. Open a PR against [Ehsan-c137/yaad `main`](https://github.com/Ehsan-c137/yaad/pulls).
3. Fill in a short description:
   - **What** changed and **why**
   - **How to test** it (steps or screenshots)
   - For UI changes: before/after screenshots or a short clip — dark **and** light mode if it affects appearance

Keep PRs focused; a PR that does one thing is much easier to review and merge. Smaller PRs land faster!

## Reporting Bugs

A great bug report includes:

- What you did and what you expected to happen
- What actually happened (error messages, screenshots)
- Steps to reproduce, ideally minimal
- Browser/OS and whether it happens in light or dark mode

## Suggesting Features

Tell us:

- The problem you're trying to solve (not just the solution)
- How it fits Yaad's calm, personal feel
- Any sketches or examples from other tools you like

## A Few Notes

- **Privacy first:** never commit real notes, backups, or personal data — including fixture files.
- **Be kind:** keep discussions respectful and assume good intent. We're all here to build something calm. 🙂

Thank you for contributing! ✨
