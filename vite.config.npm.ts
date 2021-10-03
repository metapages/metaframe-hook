// Reference: https://miyauchi.dev/posts/vite-preact-typescript/

import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Get the github pages path e.g. if served from https://<name>.github.io/<repo>/
// then we need to pull out "<repo>"
const packageName = JSON.parse(
  fs.readFileSync("./package.json", { encoding: "utf8", flag: "r" })
)["name"];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react-dom/test-utils": "preact/test-utils",
      "/@": path.resolve(__dirname, "./src"),
    },
  },
  jsx: {
    factory: "h",
    fragment: "Fragment",
  },
  // this is really stupid this should not be necessary
  plugins: [(preact as any).default()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: packageName,
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["@metapages/metapage"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          metapages: '@metapages/metapage'
        }
      }
    },
    sourcemap: true,
    minify: mode === "development" ? false : "esbuild",
    emptyOutDir: false,
  },
}));
