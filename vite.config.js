import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // jsdom gives us a fake browser so components can render in tests
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
  },
});
