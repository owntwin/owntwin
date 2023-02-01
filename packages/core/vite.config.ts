import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        store: resolve(__dirname, "src/store.ts"),
        "components/index": resolve(__dirname, "src/components/index.ts"),
        "components/Field/hooks": resolve(
          __dirname,
          "src/components/Field/hooks.ts",
        ),
        "components/ModelView/store": resolve(
          __dirname,
          "src/components/ModelView/store.ts",
        ),
        "lib/utils": resolve(__dirname, "src/lib/utils.ts"),
        "lib/components/index": resolve(
          __dirname,
          "src/lib/components/index.ts",
        ),
        // "components/Field/store": resolve(__dirname, "src/components/Field/store.ts"),
        // "components/Field/Field": resolve(__dirname, "src/components/Field/Field.tsx"),
        // "components/Camera/Camera": resolve(__dirname, "src/components/Camera/Camera.tsx"),
        // "components/Camera/index": resolve(__dirname, "src/components/Camera/index.ts"),
      },
      // name: "OwnTwinCore",
      // // the proper extensions will be added
      // fileName: "owntwin",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      plugins: [visualizer()],
      external: [
        "react",
        "react-dom",
        // "@react-three/drei",
        "@react-three/fiber",
        "three",
      ],
      output: {
        // paths: {
        //   "react/jsx-runtime": "react/jsx-runtime.js",
        // },
        // globals: {
        //   react: "React",
        //   "react-dom": "ReactDOM",
        // },
        // preserveModules: true,
        // preserveModulesRoot: "src",
      },
      // external: ["react"],
      // output: {
      //   globals: {
      //     react: "React",
      //   },
      // },
    },
    sourcemap: true,
    target: "esnext",
  },
  plugins: [dts(), react()],
});
