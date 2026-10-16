import type { Plugin } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
// import { analyzer } from "vite-bundle-analyzer";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

function atAliasPlugin(appSrc: string, uiSrc: string, coreSrc: string): Plugin {
  const cache = new Map<string, string | null>();
  const exts = ["", ".tsx", ".ts", ".jsx", ".js", ".json", ".css"];
  const indexFiles = ["index.tsx", "index.ts", "index.jsx", "index.js"];

  function tryResolveFile(baseDir: string, subPath: string): string | null {
    const target = path.resolve(baseDir, subPath);
    for (const ext of exts) {
      const file = target + ext;
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return file;
      }
    }
    for (const idx of indexFiles) {
      const file = path.join(target, idx);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return file;
      }
    }
    return null;
  }

  return {
    name: "vite-plugin-at-alias",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (!source.startsWith("@/")) return null;
      const subPath = source.slice(2);
      const cacheKey = `${importer ?? ""}:${source}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);

      const preferredDirs: string[] = [];
      if (importer?.includes("/packages/ui/")) {
        preferredDirs.push(uiSrc, appSrc, coreSrc);
      } else if (importer?.includes("/packages/core/")) {
        preferredDirs.push(coreSrc, appSrc, uiSrc);
      } else {
        preferredDirs.push(appSrc, uiSrc, coreSrc);
      }

      for (const dir of preferredDirs) {
        const resolved = tryResolveFile(dir, subPath);
        if (resolved) {
          cache.set(cacheKey, resolved);
          return resolved;
        }
      }

      cache.set(cacheKey, null);
      return null;
    },
  };
}

function removeManifestFromLanding(): Plugin {
  return {
    name: "remove-manifest-from-landing",
    enforce: "post",
    generateBundle(_, bundle) {
      const htmlFile = bundle["index.html"];

      if ("source" in htmlFile && typeof htmlFile.source === "string") {
        htmlFile.source = htmlFile.source.replace(
          /<link rel="manifest"[^>]*>/g,
          "",
        );
      }
    },
  };
}

function mpaDevPlugin(): Plugin {
  return {
    name: "mpa-dev-plugin",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split("?")[0] ?? "";

        if (
          url === "/app" ||
          url.startsWith("/app/") ||
          url.startsWith("/workspace")
        ) {
          req.url = "/app.html";
        }

        next();
      });
    },
  };
}

export default defineConfig(() => ({
  plugins: [
    atAliasPlugin(
      path.resolve(import.meta.dirname, "src"),
      path.resolve(import.meta.dirname, "../../packages/ui/src"),
      path.resolve(import.meta.dirname, "../../packages/core/src"),
    ),
    viteCompression({ algorithm: "brotliCompress" }),
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "tauri.svg",
      ],
      manifest: {
        name: "Yaad",
        short_name: "Yaad",
        description: "Personal knowledge base and visual notes",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/app",
        scope: "/",
        icons: [
          {
            src: "/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/app.html",
        navigateFallbackDenylist: [/^\/$/, /^\/landing$/, /^\/index\.html$/],
      },
    }),
    removeManifestFromLanding(),
    mpaDevPlugin(),
  ],
  build: {
    rollupOptions: {
      input: {
        landing: path.resolve(import.meta.dirname, "index.html"),
        app: path.resolve(import.meta.dirname, "app.html"),
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@ui",
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/ui/src/components/ui",
        ),
      },
      {
        find: "@yaad/core",
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/core/src",
        ),
      },
      {
        find: "@yaad/ui",
        replacement: path.resolve(import.meta.dirname, "../../packages/ui/src"),
      },
    ],
  },
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true as const,
    proxy: {
      "/auth": "http://localhost:3000",
      "/workspaces": "http://localhost:3000",
      "/sync": "http://localhost:3000",
      "/api": "http://localhost:3000",
      "/collab": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
}));
