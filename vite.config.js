import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  optimizeDeps: {
    // NOTE: For twin.macro
    esbuildOptions: {
      target: "es2020",
    },
  },
  esbuild: {
    // NOTE: For twin.macro
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  plugins: [
    react({
      babel: {
        // NOTE: For twin.macro
        plugins: ["babel-plugin-macros", "babel-plugin-styled-components"],
      },
    }),
  ],
});
