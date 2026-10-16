import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@ui": path.resolve(import.meta.dirname, "./src/components/ui"),
    },
  },
  test: {
    name: "ui",
    environment: "happy-dom",
    setupFiles: [path.resolve(import.meta.dirname, "./src/test-setup.ts")],
    testTimeout: 20000,
  },
});
