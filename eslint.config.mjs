import { defineConfig } from "@fullstacksjs/eslint-config";

export default defineConfig(
  {
    typescript: {
      tsconfigRootDir: import.meta.dirname,
    },
    react: true,
    prettier: true,
    rules: {
      "no-await-in-loop": "off",
      complexity: ["warn", { max: 35 }],
      "max-depth": ["warn", { max: 6 }],
      "max-statements": "off",
      "max-lines-per-function": "off",
    },
  },
  {
    files: ["**/*.test.*", "**/__tests__/**"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-empty-function": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "no-await-in-loop": "off",
    },
  },
);
