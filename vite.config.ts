import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    assetsDir: "static",
    rollupOptions: {
      plugins: [visualizer()],
    },
  },
  plugins: [react()],
});
