import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
// import { analyzer } from "vite-bundle-analyzer";
import viteCompression from "vite-plugin-compression";

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
    viteCompression({ algorithm: "brotliCompress" }),
    react(),
    tailwindcss(),
    VitePWA({
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
        start_url: "/",
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
      },
    }),
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
    port: 3000,
    strictPort: true,
  },
}));
