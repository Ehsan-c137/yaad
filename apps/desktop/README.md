# @yaad/desktop

The native desktop application for Yaad, powered by [Tauri v2](https://v2.tauri.app/).

---

## Overview

`@yaad/desktop` provides a lightweight, secure native desktop experience. It pairs the React 19 frontend with a Rust backend that provides native window management and local SQLite database persistence via `@tauri-apps/plugin-sql`.

## Prerequisites

- [Rust toolchain](https://www.rust-lang.org/tools/install) (stable `cargo`, `rustc`)
- Platform-specific build tools:
  - **Windows**: Microsoft Visual Studio C++ Build Tools & WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

## Scripts

```bash
# Start Tauri desktop app in development mode with live-reload
pnpm dev

# Start frontend dev server only (without launching Tauri window)
pnpm dev:web

# Typecheck and build frontend assets
pnpm build

# Build native installer / executable bundle for current platform
pnpm tauri build
```

## Release Artifacts

After running `pnpm tauri build`, the generated installers and standalone binaries are saved in:
`apps/desktop/src-tauri/target/release/bundle/`
- **Windows**: `.msi` and `.exe` (NSIS)
- **macOS**: `.dmg` and `.app`
- **Linux**: `.deb` and `.AppImage`
