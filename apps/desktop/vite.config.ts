import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

function atAliasPlugin(baseDirs: string[]) {
  return {
    name: "vite-plugin-at-alias",
    enforce: "pre" as const,
    resolveId(source: string) {
      if (!source.startsWith("@/")) return null;
      const subPath = source.slice(2);

      for (const baseDir of baseDirs) {
        const target = path.resolve(baseDir, subPath);

        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
          return target;
        }

        const exts = [".tsx", ".ts", ".jsx", ".js", ".json", ".css"];

        for (const ext of exts) {
          if (
            fs.existsSync(target + ext) &&
            fs.statSync(target + ext).isFile()
          ) {
            return target + ext;
          }
        }

        const indexPaths = [
          path.join(target, "index.tsx"),
          path.join(target, "index.ts"),
          path.join(target, "index.jsx"),
          path.join(target, "index.js"),
        ];

        for (const indexPath of indexPaths) {
          if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
            return indexPath;
          }
        }
      }

      return null;
    },
  };
}

export default defineConfig(() => ({
  plugins: [
    atAliasPlugin([
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "../../packages/ui/src"),
      path.resolve(__dirname, "../../packages/core/src"),
    ]),
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
    host: host || "127.0.0.1",
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
