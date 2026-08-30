import { defineConfig } from "@fullstacksjs/eslint-config";

export default defineConfig({
  tailwind: { entryPoint: "./src/app/globals.css" },
  typescript: {
    tsconfigRootDir: import.meta.dirname,
    allowDefaultProject: ["eslint.config.js"],
  },
});
