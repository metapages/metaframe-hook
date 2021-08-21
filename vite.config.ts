import * as fs from "fs";
import { resolve } from 'path';
import { defineConfig } from 'vite';
import preact from "@preact/preset-vite";

const APP_FQDN = process.env.APP_FQDN || "metaframe1.dev";
const APP_PORT = process.env.APP_PORT || "443";
const INSIDE_CONTAINER = fs.existsSync('/.dockerenv');
const PUBLISH_SUB_DIR = process.env.PUBLISH_SUB_DIR;
const fileKey = `./.certs/${APP_FQDN}-key.pem`;
const fileCert = `./.certs/${APP_FQDN}.pem`;

// Get the github pages path e.g. if served from https://<name>.github.io/<repo>/
// then we need to pull out "<repo>"
const packageName = JSON.parse(fs.readFileSync('./package.json', {encoding:'utf8', flag:'r'}))["name"];
const baseWebPath = packageName.split("/")[1];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // For serving NOT at the base path e.g. with github pages: https://<name>.github.io/<repo>/
  base: PUBLISH_SUB_DIR && PUBLISH_SUB_DIR !== "" ? `/${baseWebPath}/${PUBLISH_SUB_DIR}/` : `/${baseWebPath}/`,
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      "react-dom/test-utils": "preact/test-utils",
      '/@': resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  plugins: [
    preact(),
  ],
  build: {
    outDir: `docs/${PUBLISH_SUB_DIR}`,
    target: 'esnext',
    sourcemap: true,
    minify: mode === 'development' ? false : 'esbuild',
    emptyOutDir: true,
  },
  server: mode === "development" ? {
    open: INSIDE_CONTAINER ? undefined : '/',
    host: INSIDE_CONTAINER ? "0.0.0.0" : APP_FQDN,
    port: parseInt(fs.existsSync(fileKey) ? APP_PORT : "8000"),
    https: fs.existsSync(fileKey) && fs.existsSync(fileCert) ? {
      key: fs.readFileSync(fileKey),
      cert: fs.readFileSync(fileCert),
    } : undefined,
  } : {
    // glitch.com default
    strictPort: true,
    hmr: {
      port: 443 // Run the websocket server on the SSL port
    }
  }
}));
