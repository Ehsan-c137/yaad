import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: {
      "@yaad/core": path.resolve(import.meta.dirname, "./src"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    name: "core",
    environment: "happy-dom",
  },
});
