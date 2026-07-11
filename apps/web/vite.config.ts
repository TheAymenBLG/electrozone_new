import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      "@electrozone/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});