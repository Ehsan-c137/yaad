import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

function atAliasPlugin(appSrc: string, uiSrc: string, coreSrc: string) {
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

export default defineConfig(() => ({
  plugins: [
    atAliasPlugin(
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "../../packages/ui/src"),
      path.resolve(__dirname, "../../packages/core/src"),
    ),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: "@ui",
        replacement: path.resolve(
          __dirname,
          "../../packages/ui/src/components/ui",
        ),
      },
      {
        find: "@yaad/core",
        replacement: path.resolve(__dirname, "../../packages/core/src"),
      },
      {
        find: "@yaad/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src"),
      },
    ],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? "127.0.0.1",
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
