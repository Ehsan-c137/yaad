# @yaad/web

The browser and Progressive Web App (PWA) client for Yaad.

---

## Overview

`@yaad/web` is a modern web application built on Vite and React 19. It runs entirely client-side, persisting data locally in the user's browser via IndexedDB using `@yaad/core`'s `LocalJsonAdapter`.

## Features

- **PWA Support**: Full offline capability via `vite-plugin-pwa` service workers and manifest.
- **Client-Side Routing**: Handled by React Router v8 with code-splitting for heavy pages (`GraphPage`, `TrashPage`).
- **Zero Cloud Requirement**: Functions completely offline without requiring any backend server.

## Scripts

```bash
# Start Vite development server (http://localhost:5173)
pnpm dev

# Build production bundle to dist/
pnpm build

# Preview production build locally
pnpm preview
```

## Vercel Deployment

To deploy `@yaad/web` to Vercel:
- **Framework Preset**: Vite
- **Root Directory**: `.` (monorepo root)
- **Build Command**: `pnpm --filter @yaad/web build`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `pnpm install`
