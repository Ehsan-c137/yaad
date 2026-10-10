import { defineConfig } from "@fullstacksjs/eslint-config";

export default defineConfig(
  {
    typescript: {
      tsconfigRootDir: import.meta.dirname,
    },
    react: true,
    prettier: true,
  },
  {
    files: ["**/*.test.*", "**/__tests__/**"],
    rules: {      
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
