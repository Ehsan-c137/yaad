import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@ui": path.resolve(import.meta.dirname, "./src/components/ui"),
    },
    exclude: ["node_modules", "e2e/**/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
